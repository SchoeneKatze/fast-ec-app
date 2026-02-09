# utils.py
import requests
import pycountry_convert as pc

def get_currency_by_ip(ip_address: str) -> str:
    try:
        if ip_address == "127.0.0.1": return "USD"
        
        resp = requests.get(f"http://ip-api.com/json/{ip_address}", timeout=2).json()
        country_code = resp.get("countryCode")
        
        currency_code = pc.country_alpha2_to_custom_currency_short_name(country_code)
        
        return currency_code or "USD"
    except:
        return "USD"