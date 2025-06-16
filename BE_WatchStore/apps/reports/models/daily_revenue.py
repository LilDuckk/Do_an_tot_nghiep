from django.db import models

class DailyRevenue(models.Model):
    date = models.DateField()
    store_id = models.IntegerField()
    total_revenue = models.DecimalField(max_digits=25, decimal_places=2)
    total_orders = models.IntegerField()
    average_order_value = models.DecimalField(max_digits=25, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'daily_revenue_view'

    def __str__(self):
        return f"Revenue for {self.date} - Store {self.store_id}" 