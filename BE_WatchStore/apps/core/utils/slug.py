import re
import unicodedata
from django.utils.text import slugify

def create_slug(text):
    """
    Create a slug from the given text.
    """
    # Convert to ASCII
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')
    # Convert to lowercase
    text = text.lower()
    # Replace spaces with hyphens
    text = re.sub(r'\s+', '-', text)
    # Remove special characters
    text = re.sub(r'[^a-z0-9-]', '', text)
    # Remove multiple hyphens
    text = re.sub(r'-+', '-', text)
    # Remove leading and trailing hyphens
    text = text.strip('-')
    return text

def unique_slug_generator(model_instance, title, slug_field):
    """
    Generate a unique slug for a model instance.
    """
    slug = slugify(title)
    model_class = model_instance.__class__

    while model_class.objects.filter(**{slug_field: slug}).exists():
        # If the slug exists, append a number to it
        if '-' in slug:
            # If the slug already has a number, increment it
            try:
                number = int(slug.split('-')[-1])
                slug = f"{slug.rsplit('-', 1)[0]}-{number + 1}"
            except ValueError:
                # If the last part is not a number, append 1
                slug = f"{slug}-1"
        else:
            # If the slug doesn't have a number, append 1
            slug = f"{slug}-1"

    return slug 