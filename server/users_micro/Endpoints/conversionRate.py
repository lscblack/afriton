from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from models.userModels import CurrencyCategory, CurrencyRate
from db.connection import db_dependency
from db.VerifyToken import user_dependency
from datetime import datetime

router = APIRouter(prefix="/rate", tags=["rate"])

# Function to initialize default rates
async def initialize_default_rates(db: Session):
    try:
        # Check if rates already exist
        if db.query(CurrencyRate).count() > 0:
            return
        
        # Create categories
        categories = {
            "african_currencies": "African Currencies",
            "european_currencies": "European Currencies",
            "other_global_currencies": "Other Global Currencies",
            "afriton": "Afriton Conversion Rates"
        }
        
        category_ids = {}
        for cat_name, description in categories.items():
            cat = CurrencyCategory(name=cat_name, description=description)
            db.add(cat)
            db.commit()
            db.refresh(cat)
            category_ids[cat_name] = cat.id

        # Add default rates
        default_rates = [
            # African Currencies
            ("rwandan_franc", "RWF", 12000, "african_currencies"),
            ("nigerian_naira", "NGN", 7500, "african_currencies"),
            ("south_african_rand", "ZAR", 180, "african_currencies"),
            ("ghanaian_cedi", "GHS", 110, "african_currencies"),
            ("kenyan_shilling", "KES", 1480, "african_currencies"),
            ("ugandan_shilling", "UGX", 37000, "african_currencies"),
            ("egyptian_pound", "EGP", 310, "african_currencies"),
            ("moroccan_dirham", "MAD", 100, "african_currencies"),
            ("tanzanian_shilling", "TZS", 25000, "african_currencies"),
            ("zambian_kwacha", "ZMW", 220, "african_currencies"),
            ("ethiopian_birr", "ETB", 550, "african_currencies"),
            ("angolan_kwanza", "AOA", 8330, "african_currencies"),
            ("congolese_franc", "CDF", 25000, "african_currencies"),
            ("malawian_kwacha", "MWK", 16500, "african_currencies"),
            ("mozambican_metical", "MZN", 630, "african_currencies"),
            ("namibian_dollar", "NAD", 180, "african_currencies"),
            ("seychellois_rupee", "SCR", 130, "african_currencies"),
            ("somali_shilling", "SOS", 57000, "african_currencies"),
            ("sudanese_pound", "SDG", 6000, "african_currencies"),
            ("tunisian_dinar", "TND", 31, "african_currencies"),
            
            # European Currencies
            ("euro", "EUR", 9.3, "european_currencies"),
            ("british_pound", "GBP", 7.7, "european_currencies"),
            ("swiss_franc", "CHF", 8.8, "european_currencies"),
            ("norwegian_krone", "NOK", 108, "european_currencies"),
            ("swedish_krona", "SEK", 105, "european_currencies"),
            ("danish_krone", "DKK", 69.6, "european_currencies"),
            ("polish_zloty", "PLN", 42, "european_currencies"),
            ("hungarian_forint", "HUF", 3610, "european_currencies"),
            ("czech_koruna", "CZK", 230, "european_currencies"),
            ("romanian_leu", "RON", 46, "european_currencies"),
            ("bulgarian_lev", "BGN", 18.2, "european_currencies"),
            ("croatian_kuna", "HRK", 70, "european_currencies"),
            
            # Other Global Currencies
            ("us_dollar", "USD", 10, "other_global_currencies"),  # Base rate: 1 Afriton = 10 USD
            ("canadian_dollar", "CAD", 13.6, "other_global_currencies"),
            ("australian_dollar", "AUD", 15.3, "other_global_currencies"),
            ("chinese_yuan", "CNY", 72, "other_global_currencies"),
            ("japanese_yen", "JPY", 1500, "other_global_currencies"),
            ("indian_rupee", "INR", 830, "other_global_currencies"),
            ("brazilian_real", "BRL", 52, "other_global_currencies"),
            ("mexican_peso", "MXN", 170, "other_global_currencies"),
            ("turkish_lira", "TRY", 280, "other_global_currencies"),
            ("pakistani_rupee", "PKR", 3000, "other_global_currencies"),
            ("bangladeshi_taka", "BDT", 1100, "other_global_currencies"),
            ("russian_ruble", "RUB", 920, "other_global_currencies"),
            ("indonesian_rupiah", "IDR", 156000, "other_global_currencies"),
            ("malaysian_ringgit", "MYR", 47, "other_global_currencies"),
            ("singapore_dollar", "SGD", 13.5, "other_global_currencies"),
            ("thai_baht", "THB", 360, "other_global_currencies"),
            ("south_korean_won", "KRW", 13000, "other_global_currencies"),
            ("new_zealand_dollar", "NZD", 16.5, "other_global_currencies"),
            ("hong_kong_dollar", "HKD", 78, "other_global_currencies"),
            ("taiwanese_dollar", "TWD", 320, "other_global_currencies"),
            
            # Afriton conversions with unique codes
            ("afriton_to_dollar", "AFT_USD", 10, "afriton"),
            ("afriton_to_rwandan_franc", "AFT_RWF", 12000, "afriton"),
            ("afriton_to_nigerian_naira", "AFT_NGN", 7500, "afriton"),
            ("afriton_to_south_african_rand", "AFT_ZAR", 180, "afriton"),
            ("afriton_to_ghanaian_cedi", "AFT_GHS", 110, "afriton"),
            ("afriton_to_kenyan_shilling", "AFT_KES", 1480, "afriton"),
            ("afriton_to_ugandan_shilling", "AFT_UGX", 37000, "afriton"),
            ("afriton_to_euro", "AFT_EUR", 9.3, "afriton"),
        ]

        for name, code, rate_afriton, category in default_rates:
            rate = CurrencyRate(
                category_id=category_ids[category],
                currency_name=name,
                currency_code=code,
                rate_to_afriton=rate_afriton
            )
            db.add(rate)
            
        db.commit()
        
    except Exception as e:
        db.rollback()
        print(f"Error initializing rates: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initialize currency rates: {str(e)}"
        )

@router.get("/conversion-rates")
async def get_conversion_rates(db: db_dependency) -> Dict[str, Any]:
    await initialize_default_rates(db)
    
    categories = db.query(CurrencyCategory).all()
    rates = {}
    
    for category in categories:
        currencies = db.query(CurrencyRate).filter(
            CurrencyRate.category_id == category.id,
            CurrencyRate.is_active == True
        ).all()
        
        rates[category.name] = {
            curr.currency_name: f"1 afriton = {curr.rate_to_afriton} {curr.currency_code}"
            for curr in currencies
        }
    
    return rates

def convert_to_afriton(amount: float, currency_code: str, db: Session) -> float:
    """Convert any currency to Afriton"""
    rate = db.query(CurrencyRate).filter(
        CurrencyRate.currency_code == currency_code,
        CurrencyRate.is_active == True
    ).first()
    
    if not rate:
        raise HTTPException(status_code=400, detail="Unsupported currency")
    
    return amount / rate.rate_to_afriton

def convert_from_afriton(amount: float, currency_code: str, db: Session) -> float:
    """Convert Afriton to any currency"""
    rate = db.query(CurrencyRate).filter(
        CurrencyRate.currency_code == currency_code,
        CurrencyRate.is_active == True
    ).first()
    
    if not rate:
        raise HTTPException(status_code=400, detail="Unsupported currency")
    
    return amount * rate.rate_to_afriton

@router.post("/add-rate")
async def add_currency_rate(
    user: user_dependency,
    db: db_dependency,
    category_name: str,
    currency_name: str,
    currency_code: str,
    rate_to_afriton: float
):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    category = db.query(CurrencyCategory).filter(CurrencyCategory.name == category_name).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    new_rate = CurrencyRate(
        category_id=category.id,
        currency_name=currency_name,
        currency_code=currency_code,
        rate_to_afriton=rate_to_afriton
    )
    db.add(new_rate)
    db.commit()
    
    return {"message": "Currency rate added successfully"}

@router.put("/update-rate/{currency_code}")
async def update_currency_rate(
    currency_code: str,
    rate_to_afriton: float,
    user: user_dependency,
    db: db_dependency
):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    rate = db.query(CurrencyRate).filter(CurrencyRate.currency_code == currency_code).first()
    if not rate:
        raise HTTPException(status_code=404, detail="Currency rate not found")
    
    rate.rate_to_afriton = rate_to_afriton
    rate.last_updated = datetime.utcnow()
    
    db.commit()
    return {"message": "Currency rate updated successfully"}

@router.get("/convert/{amount}/{from_currency}/to/{to_currency}",
    description="""
    Convert amount between different currencies using Afriton as intermediary.
    
    ### Currency Codes
    #### African Currencies:
    - RWF (Rwandan Franc)
    - NGN (Nigerian Naira)
    - ZAR (South African Rand)
    - GHS (Ghanaian Cedi)
    - KES (Kenyan Shilling)
    - UGX (Ugandan Shilling)
    - EGP (Egyptian Pound)
    - MAD (Moroccan Dirham)
    - TZS (Tanzanian Shilling)
    - ZMW (Zambian Kwacha)
    - ETB (Ethiopian Birr)
    - AOA (Angolan Kwanza)
    
    #### European Currencies:
    - EUR (Euro)
    - GBP (British Pound)
    - CHF (Swiss Franc)
    - NOK (Norwegian Krone)
    - SEK (Swedish Krona)
    - DKK (Danish Krone)
    - PLN (Polish Zloty)
    - HUF (Hungarian Forint)
    - CZK (Czech Koruna)
    
    #### Other Global Currencies:
    - CAD (Canadian Dollar)
    - AUD (Australian Dollar)
    - CNY (Chinese Yuan)
    - JPY (Japanese Yen)
    - INR (Indian Rupee)
    - BRL (Brazilian Real)
    - MXN (Mexican Peso)
    - TRY (Turkish Lira)
    - PKR (Pakistani Rupee)
    - BDT (Bangladeshi Taka)
    
    ### Examples:
    1. Convert 1000 RWF to Afriton:
    ```
    GET /rate/convert/1000/RWF/to/afriton
    ```
    
    2. Convert 5 Afriton to KES:
    ```
    GET /rate/convert/5/afriton/to/KES
    ```
    
    3. Convert 100 EUR to NGN:
    ```
    GET /rate/convert/100/EUR/to/NGN
    ```
    
    ### Response Example:
    ```json
    {
        "original_amount": 1000,
        "original_currency": "RWF",
        "converted_amount": 0.0833,
        "target_currency": "afriton"
    }
    ```
    """)
async def convert_currency(
    amount: float,
    from_currency: str,
    to_currency: str,
    db: db_dependency
):
    if from_currency == "afriton":
        converted = convert_from_afriton(amount, to_currency, db)
    else:
        afriton_amount = convert_to_afriton(amount, from_currency, db)
        if to_currency == "afriton":
            converted = afriton_amount
        else:
            converted = convert_from_afriton(afriton_amount, to_currency, db)
    
    return {
        "original_amount": amount,
        "original_currency": from_currency,
        "converted_amount": converted,
        "target_currency": to_currency
    }