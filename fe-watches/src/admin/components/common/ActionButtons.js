import React from 'react';
import { Button, Space, Popconfirm, Tooltip } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  ReloadOutlined,
  MoreOutlined 
} from '@ant-design/icons';

/**
 * Component hiển thị các nút thao tác chung
 * @param {object} props - Props của component
 * @param {object} props.record - Record data
 * @param {function} props.onEdit - Callback khi click nút edit
 * @param {function} props.onDelete - Callback khi click nút delete
 * @param {function} props.onView - Callback khi click nút view
 * @param {function} props.onRefresh - Callback khi click nút refresh
 * @param {boolean} props.hasAccess - Có quyền truy cập không
 * @param {boolean} props.showEdit - Hiển thị nút edit không
 * @param {boolean} props.showDelete - Hiển thị nút delete không
 * @param {boolean} props.showView - Hiển thị nút view không
 * @param {boolean} props.showRefresh - Hiển thị nút refresh không
 * @param {string} props.deleteConfirmTitle - Title cho confirm delete
 * @param {string} props.deleteConfirmMessage - Message cho confirm delete
 * @param {array} props.additionalActions - Các action bổ sung
 * @param {string} props.size - Kích thước button (small, middle, large)
 * @returns {JSX.Element} - ActionButtons component
 */
const ActionButtons = ({
  record,
  onEdit,
  onDelete,
  onView,
  onRefresh,
  hasAccess = true,
  showEdit = true,
  showDelete = true,
  showView = false,
  showRefresh = false,
  deleteConfirmTitle = 'Bạn có chắc chắn muốn xóa?',
  deleteConfirmMessage = 'Hành động này không thể hoàn tác.',
  additionalActions = [],
  size = 'middle'
}) => {
  // Kiểm tra quyền truy cập
  if (!hasAccess) {
    return null;
  }

  const buttons = [];

  // Nút View
  if (showView && onView) {
    buttons.push(
      <Tooltip key="view" title="Xem chi tiết">
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => onView(record)}
          size={size}
        />
      </Tooltip>
    );
  }

  // Nút Edit
  if (showEdit && onEdit) {
    buttons.push(
      <Tooltip key="edit" title="Chỉnh sửa">
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => onEdit(record)}
          size={size}
        />
      </Tooltip>
    );
  }

  // Nút Refresh
  if (showRefresh && onRefresh) {
    buttons.push(
      <Tooltip key="refresh" title="Làm mới">
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={() => onRefresh(record)}
          size={size}
          style={{ background: '#722ed1', borderColor: '#722ed1' }}
        />
      </Tooltip>
    );
  }

  // Nút Delete
  if (showDelete && onDelete) {
    buttons.push(
      <Tooltip key="delete" title="Xóa">
        <Popconfirm
          title={deleteConfirmTitle}
          description={deleteConfirmMessage}
          onConfirm={() => onDelete(record)}
          okText="Xóa"
          cancelText="Hủy"
          okType="danger"
        >
          <Button
            danger
            icon={<DeleteOutlined />}
            size={size}
            style={{ borderColor: '#ff4d4f', color: '#ff4d4f', background: '#fff' }}
          />
        </Popconfirm>
      </Tooltip>
    );
  }

  // Các action bổ sung
  additionalActions.forEach((action, index) => {
    const {
      key = `additional-${index}`,
      icon,
      title,
      onClick,
      type = 'default',
      danger = false,
      disabled = false,
      tooltip,
      style = {}
    } = action;

    const button = (
      <Button
        key={key}
        type={type}
        danger={danger}
        icon={icon}
        onClick={() => onClick(record)}
        disabled={disabled}
        size={size}
        style={style}
      >
        {title}
      </Button>
    );

    buttons.push(
      tooltip ? (
        <Tooltip key={key} title={tooltip}>
          {button}
        </Tooltip>
      ) : (
        <React.Fragment key={key}>
          {button}
        </React.Fragment>
      )
    );
  });

  // Nếu không có button nào, return null
  if (buttons.length === 0) {
    return null;
  }

  return (
    <Space size="small">
      {buttons}
    </Space>
  );
};

export default ActionButtons; 