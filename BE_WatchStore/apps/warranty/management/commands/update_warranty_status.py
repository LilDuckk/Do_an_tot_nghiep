from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.warranty.models.warranty import Warranty
from apps.warranty.signals import update_expired_warranties, check_overdue_warranty_claims

class Command(BaseCommand):
    help = 'Cập nhật trạng thái warranty và kiểm tra claims quá hạn'

    def add_arguments(self, parser):
        parser.add_argument(
            '--update-expired',
            action='store_true',
            help='Cập nhật warranty đã hết hạn',
        )
        parser.add_argument(
            '--check-overdue',
            action='store_true',
            help='Kiểm tra claims quá hạn',
        )

    def handle(self, *args, **options):
        if options['update_expired']:
            self.stdout.write('Đang cập nhật warranty đã hết hạn...')
            update_expired_warranties()
            self.stdout.write(
                self.style.SUCCESS('Hoàn thành cập nhật warranty đã hết hạn')
            )

        if options['check_overdue']:
            self.stdout.write('Đang kiểm tra claims quá hạn...')
            check_overdue_warranty_claims()
            self.stdout.write(
                self.style.SUCCESS('Hoàn thành kiểm tra claims quá hạn')
            )

        if not options['update_expired'] and not options['check_overdue']:
            # Thực hiện cả hai nếu không có option nào được chỉ định
            self.stdout.write('Đang cập nhật warranty đã hết hạn...')
            update_expired_warranties()
            
            self.stdout.write('Đang kiểm tra claims quá hạn...')
            check_overdue_warranty_claims()
            
            self.stdout.write(
                self.style.SUCCESS('Hoàn thành tất cả các tác vụ')
            ) 