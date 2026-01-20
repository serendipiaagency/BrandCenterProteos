#!/usr/bin/env python3
"""
Quick verification script to check user brand permissions.
"""
import sqlite3
import json

DB_PATH = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/fc50b649db51ed0c303ff2c4b7c0eca2da269cc3dfc7ce40615fc37a7b53366c.sqlite'

def main():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get brand mapping
    cursor.execute("SELECT id, display_name FROM brands WHERE active = 1 ORDER BY id")
    brands = {id: name for id, name in cursor.fetchall()}
    
    print("=" * 80)
    print("BRAND PERMISSIONS VERIFICATION")
    print("=" * 80)
    print()
    
    # Count users by number of brands
    cursor.execute("""
        SELECT 
            CASE 
                WHEN LENGTH(brands_access) - LENGTH(REPLACE(brands_access, ',', '')) + 1 = 1 THEN '1 brand'
                WHEN LENGTH(brands_access) - LENGTH(REPLACE(brands_access, ',', '')) + 1 = 2 THEN '2 brands'
                WHEN LENGTH(brands_access) - LENGTH(REPLACE(brands_access, ',', '')) + 1 = 3 THEN '3 brands'
                WHEN LENGTH(brands_access) - LENGTH(REPLACE(brands_access, ',', '')) + 1 = 4 THEN '4 brands'
                WHEN LENGTH(brands_access) - LENGTH(REPLACE(brands_access, ',', '')) + 1 = 5 THEN '5 brands'
                WHEN LENGTH(brands_access) - LENGTH(REPLACE(brands_access, ',', '')) + 1 >= 6 THEN '6+ brands'
                ELSE 'No brands'
            END as brand_count,
            COUNT(*) as user_count
        FROM users
        WHERE role = 'distributor' AND active = 1
        GROUP BY brand_count
        ORDER BY brand_count
    """)
    
    print("Distribution of users by brand count:")
    print("-" * 40)
    for row in cursor.fetchall():
        print(f"  {row[0]:15} → {row[1]:3} users")
    
    print()
    print("=" * 80)
    print()
    
    # Sample users with their brands
    cursor.execute("""
        SELECT name, email, brands_access 
        FROM users 
        WHERE role = 'distributor' AND active = 1
        ORDER BY RANDOM()
        LIMIT 5
    """)
    
    print("Sample Users (5 random):")
    print("-" * 80)
    
    for name, email, brands_json in cursor.fetchall():
        if brands_json:
            brand_ids = json.loads(brands_json)
            brand_names = [brands.get(bid, f"Unknown-{bid}") for bid in brand_ids]
            print(f"\n👤 {name}")
            print(f"   📧 {email}")
            print(f"   🏷️  {len(brand_ids)} brands: {', '.join(brand_names)}")
        else:
            print(f"\n👤 {name}")
            print(f"   📧 {email}")
            print(f"   ⚠️  No brands assigned")
    
    print()
    print("=" * 80)
    
    # Brand popularity
    print("\nBrand Usage Statistics:")
    print("-" * 80)
    
    cursor.execute("SELECT id, display_name FROM brands WHERE active = 1 ORDER BY display_name")
    all_brands = cursor.fetchall()
    
    cursor.execute("SELECT brands_access FROM users WHERE role = 'distributor' AND active = 1")
    all_users_brands = cursor.fetchall()
    
    brand_counts = {}
    for (brands_json,) in all_users_brands:
        if brands_json:
            brand_ids = json.loads(brands_json)
            for bid in brand_ids:
                brand_counts[bid] = brand_counts.get(bid, 0) + 1
    
    for bid, name in sorted(all_brands, key=lambda x: brand_counts.get(x[0], 0), reverse=True):
        count = brand_counts.get(bid, 0)
        bar = '█' * min(count, 50)
        print(f"  {name:25} {bar:50} {count:3} users")
    
    print()
    print("=" * 80)
    
    conn.close()

if __name__ == '__main__':
    main()
