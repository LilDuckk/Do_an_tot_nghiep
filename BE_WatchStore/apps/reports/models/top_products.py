from django.db import models

class TopProduct(models.Model):
    product_id = models.IntegerField()
    product_name = models.CharField(max_length=255)
    store_id = models.IntegerField()
    total_quantity = models.IntegerField()
    total_revenue = models.DecimalField(max_digits=25, decimal_places=2)
    date = models.DateField()

    class Meta:
        managed = True
        db_table = 'orderdetail'  # Chuyển sang bảng thực tế, hoặc xóa model này nếu không dùng nữa

    def __str__(self):
        return f"{self.product_name} - Store {self.store_id}" 