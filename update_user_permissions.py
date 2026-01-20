#!/usr/bin/env python3
"""
Update user brand permissions based on Excel file.
Maps brand columns from Excel to brand IDs in database.
"""
import pandas as pd
import sqlite3
import json
import sys

# Database path
DB_PATH = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/fc50b649db51ed0c303ff2c4b7c0eca2da269cc3dfc7ce40615fc37a7b53366c.sqlite'

# Excel file path
EXCEL_PATH = '/home/user/uploaded_files/BRAND CENTER - TABLA PERMISOS.xlsx'

# Mapping: Excel column name → Brand name in database
BRAND_MAPPING = {
    'Pack \nHA 1.5': 'pack_ha_15',
    'Pack \nHA 2.0': 'pack_ha_20',
    'Solutions \nHA 2.0': 'solutions_ha_20',
    'HA \nCORRECTOR': 'ha_corrector',
    'WAID': 'waid',
    'SHS30+\nHIGH': 'shs30_high',
    'SPECIFIC': 'specific',
    'PLUS': 'plus',
    'SMARTKER': 'smartker',
    # Note: USA SPECIFIC and USA SMARTKER are in Excel but not in our brand list
    # We'll skip those for now
}

def main():
    # Connect to database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get brand name to ID mapping from database
    cursor.execute("SELECT id, name FROM brands WHERE active = 1")
    brand_id_map = {name: id for id, name in cursor.fetchall()}
    
    print("Brand ID mapping from database:")
    for name, id in brand_id_map.items():
        print(f"  {name} → ID {id}")
    print()
    
    # Read Excel file
    df = pd.read_excel(EXCEL_PATH)
    print(f"Read {len(df)} rows from Excel\n")
    
    # Process each user
    updated_count = 0
    skipped_count = 0
    
    for idx, row in df.iterrows():
        email = row['MAIL DISTRIBUIDOR']
        name = row['NOMBRE']
        
        if pd.isna(email) or email == 'admin@proteos.com':
            print(f"Skipping row {idx+1}: {name} ({email})")
            skipped_count += 1
            continue
        
        # Check if user exists
        cursor.execute("SELECT id, name, brands_access FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        
        if not user:
            print(f"User not found: {email} - skipping")
            skipped_count += 1
            continue
        
        user_id, user_name, current_brands = user
        
        # Build brand access list based on Excel checkmarks
        brand_ids = []
        brand_names = []
        
        for excel_col, brand_name in BRAND_MAPPING.items():
            if excel_col in df.columns:
                value = row[excel_col]
                # Check if there's a checkmark (√) or any non-empty value
                if pd.notna(value) and str(value).strip():
                    if brand_name in brand_id_map:
                        brand_id = brand_id_map[brand_name]
                        brand_ids.append(brand_id)
                        brand_names.append(brand_name)
        
        if not brand_ids:
            print(f"No brands for: {email} - skipping")
            skipped_count += 1
            continue
        
        # Convert to JSON array
        brands_json = json.dumps(brand_ids)
        
        # Update user
        cursor.execute("""
            UPDATE users 
            SET brands_access = ? 
            WHERE id = ?
        """, (brands_json, user_id))
        
        updated_count += 1
        print(f"✓ Updated {email}: {len(brand_ids)} brands → {', '.join(brand_names)}")
    
    # Commit changes
    conn.commit()
    conn.close()
    
    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  Updated: {updated_count} users")
    print(f"  Skipped: {skipped_count} rows")
    print(f"  Total:   {updated_count + skipped_count} rows processed")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
