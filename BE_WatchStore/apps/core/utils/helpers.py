import datetime
from django.utils import timezone
from django.db.models import Q

def get_date_range(start_date=None, end_date=None):
    """
    Get date range for filtering.
    """
    if not start_date:
        start_date = timezone.now().date() - datetime.timedelta(days=30)
    if not end_date:
        end_date = timezone.now().date()
    return start_date, end_date

def get_search_query(search_fields, search_term):
    """
    Create a Q object for searching across multiple fields.
    """
    if not search_term:
        return Q()
    
    query = Q()
    for field in search_fields:
        query |= Q(**{f"{field}__icontains": search_term})
    return query

def format_currency(amount):
    """
    Format amount as currency.
    """
    return f"{amount:,.2f}"

def get_file_extension(filename):
    """
    Get file extension from filename.
    """
    return filename.split('.')[-1].lower()

def is_valid_file_type(filename, allowed_extensions):
    """
    Check if file type is allowed.
    """
    return get_file_extension(filename) in allowed_extensions 