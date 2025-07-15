import React, { useState, useEffect } from 'react';
import { Spin, Alert, Card, Row, Col, Typography, Divider } from 'antd';
import { 
  PhoneOutlined, 
  MailOutlined, 
  ClockCircleOutlined, 
  EnvironmentOutlined,
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  TikTokOutlined
} from '@ant-design/icons';
import Header from './Header';
import Footer from './Footer';
import './static/Contact.css';

const { Title, Text, Paragraph } = Typography;

export default function Contact() {
  const [contactInfos, setContactInfos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    fetchContactInfos();
  }, []);

  const fetchContactInfos = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/content/contact-infos/all/');
      
      if (!response.ok) {
        throw new Error('Không thể tải thông tin liên hệ');
      }
      
      const data = await response.json();
      const activeContacts = data.filter(contact => contact.is_active);
      setContactInfos(activeContacts);
      
      // Tự động chọn contact đầu tiên để hiển thị map
      if (activeContacts.length > 0) {
        setSelectedContact(activeContacts[0]);
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
      setError('Không thể tải thông tin liên hệ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm tạo Google Maps URL từ địa chỉ
  const getGoogleMapsUrl = (address) => {
    if (!address) return null;
    const encodedAddress = encodeURIComponent(address);
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  };

  // Hàm tạo Google Maps embed URL
  const getGoogleMapsEmbedUrl = (address) => {
    if (!address) return null;
    const encodedAddress = encodeURIComponent(address);
    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedAddress}`;
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="contact-container">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '20px' }}>Đang tải thông tin liên hệ...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div className="contact-container">
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '20px' }}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="contact-container">
        <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>
          Liên hệ với chúng tôi
        </Title>

        {contactInfos.length === 0 ? (
          <Alert
            message="Thông báo"
            description="Hiện tại không có thông tin liên hệ nào."
            type="info"
            showIcon
          />
        ) : (
          <Row gutter={[24, 24]}>
            {/* Danh sách thông tin liên hệ */}
            <Col xs={24} lg={12}>
              <Title level={3} style={{ marginBottom: '20px' }}>
                Thông tin liên hệ
              </Title>
              
              {contactInfos.map((contact, index) => (
                <Card
                  key={contact.id}
                  style={{ 
                    marginBottom: '16px',
                    cursor: 'pointer',
                    border: selectedContact?.id === contact.id ? '2px solid #1890ff' : '1px solid #d9d9d9'
                  }}
                  onClick={() => setSelectedContact(contact)}
                  hoverable
                >
                  <div style={{ marginBottom: '12px' }}>
                    <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                      {contact.company_name}
                    </Title>
                  </div>

                  {contact.address && (
                    <div style={{ marginBottom: '8px' }}>
                      <EnvironmentOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                      <Text strong>Địa chỉ:</Text> {contact.address}
                      {getGoogleMapsUrl(contact.address) && (
                        <a
                          href={getGoogleMapsUrl(contact.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ marginLeft: '8px', color: '#1890ff' }}
                        >
                          (Xem trên Google Maps)
                        </a>
                      )}
                    </div>
                  )}

                  {contact.phone && (
                    <div style={{ marginBottom: '8px' }}>
                      <PhoneOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                      <Text strong>Điện thoại:</Text> {contact.phone}
                    </div>
                  )}

                  {contact.email && (
                    <div style={{ marginBottom: '8px' }}>
                      <MailOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                      <Text strong>Email:</Text> {contact.email}
                    </div>
                  )}

                  {contact.working_hours && (
                    <div style={{ marginBottom: '8px' }}>
                      <ClockCircleOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                      <Text strong>Giờ làm việc:</Text> {contact.working_hours}
                    </div>
                  )}

                  {/* Social Media Links */}
                  {(contact.facebook_url || contact.instagram_url || contact.youtube_url || contact.tiktok_url) && (
                    <div style={{ marginTop: '12px' }}>
                      <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                        Mạng xã hội:
                      </Text>
                      <div className="contact-social" style={{ display: 'flex', gap: '12px' }}>
                        {contact.facebook_url && (
                          <a
                            href={contact.facebook_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#1877f2', fontSize: '20px' }}
                          >
                            <FacebookOutlined />
                          </a>
                        )}
                        {contact.instagram_url && (
                          <a
                            href={contact.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#e4405f', fontSize: '20px' }}
                          >
                            <InstagramOutlined />
                          </a>
                        )}
                        {contact.youtube_url && (
                          <a
                            href={contact.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#ff0000', fontSize: '20px' }}
                          >
                            <YoutubeOutlined />
                          </a>
                        )}
                        {contact.tiktok_url && (
                          <a
                            href={contact.tiktok_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#000000', fontSize: '20px' }}
                          >
                            <TikTokOutlined />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </Col>

            {/* Google Maps */}
            <Col xs={24} lg={12}>
              <Title level={3} style={{ marginBottom: '20px' }}>
                Vị trí
              </Title>
              
              {selectedContact ? (
                <div>
                  <Card style={{ marginBottom: '16px' }}>
                    <Title level={4} style={{ marginBottom: '12px' }}>
                      {selectedContact.company_name}
                    </Title>
                    {selectedContact.address && (
                      <Paragraph>
                        <EnvironmentOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                        {selectedContact.address}
                      </Paragraph>
                    )}
                  </Card>
                  
                  {selectedContact.address && getGoogleMapsEmbedUrl(selectedContact.address) ? (
                    <div style={{ border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden' }}>
                      <iframe
                        title="Google Maps"
                        src={getGoogleMapsEmbedUrl(selectedContact.address)}
                        width="100%"
                        height="400"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  ) : (
                    <Card>
                      <Text type="secondary">Không có địa chỉ để hiển thị bản đồ</Text>
                    </Card>
                  )}
                </div>
              ) : (
                <Card>
                  <Text type="secondary">Vui lòng chọn một địa điểm để xem bản đồ</Text>
                </Card>
              )}
            </Col>
          </Row>
        )}

        <Divider />

        {/* Thông tin bổ sung */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <Title level={4}>Hỗ trợ khách hàng</Title>
          <Paragraph>
            Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Hãy liên hệ với chúng tôi qua các kênh trên để được tư vấn và hỗ trợ tốt nhất.
          </Paragraph>
        </div>
      </div>
      <Footer />
    </div>
  );
} 