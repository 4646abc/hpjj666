#!/usr/bin/env python3
import argparse
import json
import gzip
import base64
import os
import shutil
from datetime import datetime
from pathlib import Path

VERSION_FILE = 'data/version.json'
CHUNK_SIZE = 500
BACKUP_DIR = 'data/backups'
DATA_DIR = 'data'


def parse_h_file(file_path):
    data = []
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split('--')
            if len(parts) >= 4:
                item = {
                    'i': parts[0],
                    'r': parts[1],
                    'n': parts[2].strip('[]'),
                    'o': parts[3].strip('[]')
                }
                data.append(item)
    return data


def save_chunks(data, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    chunks = [data[i:i + CHUNK_SIZE] for i in range(0, len(data), CHUNK_SIZE)]
    index = {
        'total': len(data),
        'chunkSize': CHUNK_SIZE,
        'chunks': len(chunks),
        'timestamp': datetime.now().isoformat()
    }
    for i, chunk in enumerate(chunks):
        with gzip.open(f'{output_dir}/chunk_{i:04d}.json.gz', 'wt', encoding='utf-8') as f:
            json.dump(chunk, f, ensure_ascii=False)
    with open(f'{output_dir}/index.json', 'w', encoding='utf-8') as f:
        json.dump(index, f, ensure_ascii=False)
    return index


def create_backup(source_dir):
    os.makedirs(BACKUP_DIR, exist_ok=True)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = f'{BACKUP_DIR}/backup_{timestamp}'
    if os.path.exists(source_dir):
        shutil.copytree(source_dir, backup_path)
    return backup_path


def rollback(backup_name=None):
    backups = sorted(os.listdir(BACKUP_DIR), reverse=True)
    if not backups:
        print('No backups found')
        return False
    target = backup_name if backup_name else backups[0]
    backup_path = f'{BACKUP_DIR}/{target}'
    if os.path.exists(DATA_DIR):
        shutil.rmtree(DATA_DIR)
    shutil.copytree(backup_path, DATA_DIR)
    print(f'Rolled back to {target}')
    return True


def get_current_version():
    if os.path.exists(VERSION_FILE):
        with open(VERSION_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None


def update_version(version_info):
    os.makedirs(os.path.dirname(VERSION_FILE), exist_ok=True)
    with open(VERSION_FILE, 'w', encoding='utf-8') as f:
        json.dump(version_info, f, ensure_ascii=False, indent=2)


def incremental_update(new_data, old_data):
    old_dict = {item['i']: item for item in old_data}
    new_dict = {item['i']: item for item in new_data}
    added = []
    updated = []
    removed = []
    for i, item in new_dict.items():
        if i not in old_dict:
            added.append(item)
        elif old_dict[i] != item:
            updated.append(item)
    for i, item in old_dict.items():
        if i not in new_dict:
            removed.append(item)
    return {'added': added, 'updated': updated, 'removed': removed, 'total': new_data}


def main():
    parser = argparse.ArgumentParser(description='Data Update Tool')
    parser.add_argument('input', nargs='?', help='Input .h file')
    parser.add_argument('--rollback', help='Rollback to backup (latest if not specified)')
    parser.add_argument('--list-backups', action='store_true', help='List available backups')
    parser.add_argument('--version', help='Set version tag')
    args = parser.parse_args()

    if args.list_backups:
        if os.path.exists(BACKUP_DIR):
            backups = sorted(os.listdir(BACKUP_DIR), reverse=True)
            print('Available backups:')
            for b in backups:
                print(f'  {b}')
        else:
            print('No backups found')
        return

    if args.rollback is not None:
        rollback(args.rollback if args.rollback != '' else None)
        return

    if not args.input:
        parser.print_help()
        return

    old_version = get_current_version()
    old_data = []
    if old_version and os.path.exists(DATA_DIR):
        for i in range(old_version.get('chunks', 0)):
            chunk_file = f'{DATA_DIR}/chunk_{i:04d}.json.gz'
            if os.path.exists(chunk_file):
                with gzip.open(chunk_file, 'rt', encoding='utf-8') as f:
                    old_data.extend(json.load(f))

    print('Parsing input file...')
    new_data = parse_h_file(args.input)
    print(f'Loaded {len(new_data)} items')

    diff = incremental_update(new_data, old_data)
    print(f'Added: {len(diff["added"])}')
    print(f'Updated: {len(diff["updated"])}')
    print(f'Removed: {len(diff["removed"])}')

    if old_data:
        print('Creating backup...')
        create_backup(DATA_DIR)

    print('Saving chunks...')
    index = save_chunks(new_data, DATA_DIR)
    version_info = {
        'version': args.version or datetime.now().strftime('%Y%m%d_%H%M%S'),
        'timestamp': datetime.now().isoformat(),
        'totalItems': len(new_data),
        'chunks': index['chunks'],
        'chunkSize': index['chunkSize']
    }
    update_version(version_info)

    print(f'Update complete. Version: {version_info["version"]}')


if __name__ == '__main__':
    main()
