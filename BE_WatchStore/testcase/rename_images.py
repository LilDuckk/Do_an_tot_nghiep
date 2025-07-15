import os
import glob
from pathlib import Path

def rename_images_by_size():
    """
    Đổi tên các ảnh trong thư mục VIET&CO theo thứ tự kích cỡ file
    """
    # Đường dẫn đến thư mục ảnh
    image_dir = Path("media/VIET&CO")
    
    if not image_dir.exists():
        print(f"Thư mục {image_dir} không tồn tại!")
        return
    
    # Lấy tất cả file ảnh
    image_files = []
    for ext in ['*.webp', '*.jpg', '*.jpeg', '*.png']:
        image_files.extend(glob.glob(str(image_dir / ext)))
    
    if not image_files:
        print("Không tìm thấy file ảnh nào!")
        return
    
    # Sắp xếp theo kích cỡ file
    image_files_with_size = []
    for file_path in image_files:
        file_size = os.path.getsize(file_path)
        image_files_with_size.append((file_path, file_size))
    
    # Sắp xếp theo kích cỡ tăng dần
    image_files_with_size.sort(key=lambda x: x[1])
    
    print(f"Tìm thấy {len(image_files_with_size)} file ảnh")
    print("Sắp xếp theo kích cỡ (tăng dần):")
    
    # Đổi tên file
    for index, (old_path, file_size) in enumerate(image_files_with_size, 1):
        old_path = Path(old_path)
        file_extension = old_path.suffix
        
        # Tạo tên mới theo format: 001.webp, 002.webp, ...
        new_name = f"{index:03d}{file_extension}"
        new_path = old_path.parent / new_name
        
        # Kiểm tra xem tên mới đã tồn tại chưa
        counter = 1
        while new_path.exists():
            new_name = f"{index:03d}_{counter}{file_extension}"
            new_path = old_path.parent / new_name
            counter += 1
        
        try:
            # Đổi tên file
            old_path.rename(new_path)
            print(f"Đổi tên: {old_path.name} -> {new_name} (Kích cỡ: {file_size:,} bytes)")
        except Exception as e:
            print(f"Lỗi khi đổi tên {old_path.name}: {e}")
    
    print(f"\nHoàn thành đổi tên {len(image_files_with_size)} file ảnh!")

if __name__ == "__main__":
    rename_images_by_size() 