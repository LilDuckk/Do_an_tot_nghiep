--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-05-17 21:53:48

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5406 (class 0 OID 30045)
-- Dependencies: 256
-- Data for Name: attributetype; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5420 (class 0 OID 30105)
-- Dependencies: 270
-- Data for Name: attributevalue; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5378 (class 0 OID 29792)
-- Dependencies: 228
-- Data for Name: useraccount; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.useraccount VALUES (3, 'pbkdf2_sha256$720000$3fA5C977xUe2vJbTJfpaoV$BHiVG8Nc19c8YWoRqnC1JU+TdYL5hJcqK35tBeqUB9o=', false, 'duc', 'dudc@gmail.com', '2025-05-14 15:53:19.362155+07', true, true, 0, NULL, '2025-05-14 15:13:15.769399+07', '2025-05-14 15:13:15.769399+07');
INSERT INTO public.useraccount VALUES (8, 'pbkdf2_sha256$720000$CM6slT6GcsMLD5PMUWJToA$QgFwUwRRBLCHHKqEnPGSbFn0w3N/+sma8MryIGZImwc=', false, 'newuseffdr', 'newfduser@example.com', NULL, true, true, 0, NULL, '2025-05-15 19:20:05.60034+07', '2025-05-15 19:20:05.60034+07');
INSERT INTO public.useraccount VALUES (9, 'pbkdf2_sha256$720000$wQKbzrRWtqdDVP4pQVULvN$AcoDDAeVLx56i723cw9gL0lpjm1bie3vczQPucek7r4=', false, 'admindf', 'vitconcodon13@gmail.com', NULL, true, true, 0, NULL, '2025-05-15 19:22:11.586694+07', '2025-05-15 19:22:11.586694+07');
INSERT INTO public.useraccount VALUES (10, 'pbkdf2_sha256$720000$pZ1Sss9GTFZTw1nk4RrG8I$50p7cgi7Q7FA8TapqrlBzqsyJfXs1ckbU0ssZJunCzw=', false, 'admin543', 'fdfdfgdf@gmail.com', NULL, true, true, 0, NULL, '2025-05-16 13:26:27.987046+07', '2025-05-16 13:26:27.987046+07');
INSERT INTO public.useraccount VALUES (11, 'pbkdf2_sha256$720000$jSLFz3ZuZ8vzqF13e98WwN$k0X2NTV4vL17dMfNYoTKrV5CeMmbYHy1GPd4m8sX3rU=', false, 'admingfffd', 'dsfdsfdsfdsf@mgial.com', NULL, true, true, 0, NULL, '2025-05-16 14:57:03.18464+07', '2025-05-16 14:57:03.18464+07');
INSERT INTO public.useraccount VALUES (6, 'pbkdf2_sha256$720000$4uLDUFqKHEpGpDue124s3o$hDKBwqogK8euae01gU3uLuX6GI0a+RtUbCHty5XMlu8=', false, 'do nisi est', '6nLLUpT3DSt0@UIlKqMxukCwsXuQpcXUprOHL.dlg', NULL, true, true, 0, NULL, '2025-05-15 13:43:26.177454+07', '2025-05-16 15:05:59.640413+07');
INSERT INTO public.useraccount VALUES (7, 'pbkdf2_sha256$720000$9P9s8J8afLcuTDzyatHD90$OIEPYP9RP04mYoiJMgfi9gy/PQebvVn44XXL+JcEx8M=', false, 'fsewuser', 'newdguser@example.com', NULL, true, true, 0, NULL, '2025-05-15 13:52:31.218798+07', '2025-05-16 15:07:13.568033+07');
INSERT INTO public.useraccount VALUES (1, 'pbkdf2_sha256$720000$2waB0HgMB7JbvlO0jotP2t$aqfDssDIP13ySoeWds8JDSeSImANVziae11fnJbIuMo=', true, 'admin', 'admin@gmail.com', '2025-05-14 16:29:21.863338+07', true, true, 0, NULL, '2025-05-14 14:35:49.744895+07', '2025-05-16 15:59:45.204981+07');
INSERT INTO public.useraccount VALUES (4, 'pbkdf2_sha256$720000$pTMqPaNlCbiby49HcJ0SJC$hHlKALDyGMlEYnFrTmJswDTCstpfgdV04W8iy7bafDc=', false, 'viet', 'dsad@gmail.com', NULL, true, true, 0, NULL, '2025-05-14 15:55:37.257818+07', '2025-05-16 16:19:41.579607+07');


--
-- TOC entry 5398 (class 0 OID 30001)
-- Dependencies: 248
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.audit_log VALUES (98, false, '2025-05-17 18:25:19.345685+07', '2025-05-17 18:25:19.346684+07', 'CREATE', 'products.brand', '2', '{"id": 2, "name": "Rolox", "slug": null, "is_active": null, "created_by": null, "is_deleted": false, "meta_title": null, "updated_by": null, "description": "", "display_order": null, "meta_description": null}', '{"id": 2, "name": "Rolox", "slug": null, "is_active": null, "created_by": null, "is_deleted": false, "meta_title": null, "updated_by": null, "description": "", "display_order": null, "meta_description": null}', NULL, '2025-05-17 18:25:19.346684+07', NULL);
INSERT INTO public.audit_log VALUES (123, false, '2025-05-17 20:10:10.019532+07', '2025-05-17 20:10:10.019532+07', 'CREATE', 'products.brand', '3', '{"id": 3, "name": "Casio", "slug": null, "is_active": null, "created_by": null, "is_deleted": false, "meta_title": null, "updated_by": null, "description": "", "display_order": null, "meta_description": null}', '{"id": 3, "name": "Casio", "slug": null, "is_active": null, "created_by": null, "is_deleted": false, "meta_title": null, "updated_by": null, "description": "", "display_order": null, "meta_description": null}', NULL, '2025-05-17 20:10:10.020983+07', NULL);
INSERT INTO public.audit_log VALUES (99, false, '2025-05-17 18:31:37.279548+07', '2025-05-17 18:31:37.279548+07', 'UPDATE', 'products.category', '2', '{"id": 2, "name": "Cool Watches", "slug": null, "parent": null, "is_active": null, "created_by": null, "is_deleted": false, "meta_title": null, "updated_by": null, "description": "Modern smart watches with advanced features", "display_order": null, "meta_description": null}', '{"id": 2, "name": "Cool Watches", "slug": null, "parent": null, "is_active": null, "created_by": null, "is_deleted": false, "meta_title": null, "updated_by": null, "description": "Modern smart watches with advanced features", "display_order": null, "meta_description": null}', NULL, '2025-05-17 18:31:37.280551+07', NULL);
INSERT INTO public.audit_log VALUES (124, false, '2025-05-17 20:10:19.550268+07', '2025-05-17 20:10:19.550268+07', 'CREATE', 'products.brand', '4', '{"id": 4, "name": "Patek Philip", "slug": null, "is_active": null, "created_by": null, "is_deleted": false, "meta_title": null, "updated_by": null, "description": "", "display_order": null, "meta_description": null}', '{"id": 4, "name": "Patek Philip", "slug": null, "is_active": null, "created_by": null, "is_deleted": false, "meta_title": null, "updated_by": null, "description": "", "display_order": null, "meta_description": null}', NULL, '2025-05-17 20:10:19.550268+07', NULL);
INSERT INTO public.audit_log VALUES (100, false, '2025-05-17 18:32:09.257335+07', '2025-05-17 18:32:09.257335+07', 'CREATE', 'products.category', '3', '{"id": 3, "name": "Đồng hồ hơi thông minh", "slug": null, "parent": "Category object (1)", "is_active": null, "created_by": null, "is_deleted": false, "meta_title": null, "updated_by": null, "description": "", "display_order": null, "meta_description": null}', '{"id": 3, "name": "Đồng hồ hơi thông minh", "slug": null, "parent": "Category object (1)", "is_active": null, "created_by": null, "is_deleted": false, "meta_title": null, "updated_by": null, "description": "", "display_order": null, "meta_description": null}', NULL, '2025-05-17 18:32:09.258329+07', NULL);
INSERT INTO public.audit_log VALUES (125, false, '2025-05-17 20:33:51.095043+07', '2025-05-17 20:33:51.09605+07', 'CREATE', 'products.category', '7', '{"id": 7, "name": "Nam", "slug": null, "parent": null, "is_active": null, "created_by": null, "is_deleted": false, "meta_title": null, "updated_by": null, "description": "Nam", "display_order": null, "meta_description": null}', '{"id": 7, "name": "Nam", "slug": null, "parent": null, "is_active": null, "created_by": null, "is_deleted": false, "meta_title": null, "updated_by": null, "description": "Nam", "display_order": null, "meta_description": null}', NULL, '2025-05-17 20:33:51.098038+07', NULL);
INSERT INTO public.audit_log VALUES (101, false, '2025-05-17 18:32:21.117068+07', '2025-05-17 18:32:21.117068+07', 'CREATE', 'products.category', '4', '{"id": 4, "name": "Đồng hồ gái", "slug": null, "parent": "Category object (2)", "is_active": null, "created_by": null, "is_deleted": false, "meta_title": null, "updated_by": null, "description": "", "display_order": null, "meta_description": null}', '{"id": 4, "name": "Đồng hồ gái", "slug": null, "parent": "Category object (2)", "is_active": null, "created_by": null, "is_deleted": false, "meta_title": null, "updated_by": null, "description": "", "display_order": null, "meta_description": null}', NULL, '2025-05-17 18:32:21.117068+07', NULL);
INSERT INTO public.audit_log VALUES (126, false, '2025-05-17 20:33:56.599952+07', '2025-05-17 20:33:56.599952+07', 'CREATE', 'products.category', '8', '{"id": 8, "name": "Nữ", "slug": null, "parent": null, "is_active": null, "created_by": null, "is_deleted": false, "meta_title": null, "updated_by": null, "description": "", "display_order": null, "meta_description": null}', '{"id": 8, "name": "Nữ", "slug": null, "parent": null, "is_active": null, "created_by": null, "is_deleted": false, "meta_title": null, "updated_by": null, "description": "", "display_order": null, "meta_description": null}', NULL, '2025-05-17 20:33:56.600956+07', NULL);
INSERT INTO public.audit_log VALUES (102, false, '2025-05-17 18:32:28.316738+07', '2025-05-17 18:32:28.316738+07', 'CREATE', 'products.category', '5', '{"id": 5, "name": "Đồng hồ trai", "slug": null, "parent": "Category object (2)", "is_active": null, "created_by": null, "is_deleted": false, "meta_title": null, "updated_by": null, "description": "", "display_order": null, "meta_description": null}', '{"id": 5, "name": "Đồng hồ trai", "slug": null, "parent": "Category object (2)", "is_active": null, "created_by": null, "is_deleted": false, "meta_title": null, "updated_by": null, "description": "", "display_order": null, "meta_description": null}', NULL, '2025-05-17 18:32:28.317739+07', NULL);
INSERT INTO public.audit_log VALUES (127, false, '2025-05-17 20:34:20.672093+07', '2025-05-17 20:34:20.672093+07', 'CREATE', 'products.category', '9', '{"id": 9, "name": "Đồng hồ cho bé trai", "slug": null, "parent": "Category object (7)", "is_active": null, "created_by": null, "is_deleted": false, "meta_title": null, "updated_by": null, "description": "", "display_order": null, "meta_description": null}', '{"id": 9, "name": "Đồng hồ cho bé trai", "slug": null, "parent": "Category object (7)", "is_active": null, "created_by": null, "is_deleted": false, "meta_title": null, "updated_by": null, "description": "", "display_order": null, "meta_description": null}', NULL, '2025-05-17 20:34:20.672093+07', NULL);
INSERT INTO public.audit_log VALUES (103, false, '2025-05-17 18:32:38.242774+07', '2025-05-17 18:32:38.242774+07', 'CREATE', 'products.category', '6', '{"id": 6, "name": "Đồng hồ thể dục", "slug": null, "parent": "Category object (1)", "is_active": null, "created_by": null, "is_deleted": false, "meta_title": null, "updated_by": null, "description": "", "display_order": null, "meta_description": null}', '{"id": 6, "name": "Đồng hồ thể dục", "slug": null, "parent": "Category object (1)", "is_active": null, "created_by": null, "is_deleted": false, "meta_title": null, "updated_by": null, "description": "", "display_order": null, "meta_description": null}', NULL, '2025-05-17 18:32:38.243774+07', NULL);
INSERT INTO public.audit_log VALUES (128, false, '2025-05-17 20:34:31.665924+07', '2025-05-17 20:34:31.665924+07', 'CREATE', 'products.category', '10', '{"id": 10, "name": "Đồng hồ cho bé gái", "slug": null, "parent": "Category object (8)", "is_active": null, "created_by": null, "is_deleted": false, "meta_title": null, "updated_by": null, "description": "", "display_order": null, "meta_description": null}', '{"id": 10, "name": "Đồng hồ cho bé gái", "slug": null, "parent": "Category object (8)", "is_active": null, "created_by": null, "is_deleted": false, "meta_title": null, "updated_by": null, "description": "", "display_order": null, "meta_description": null}', NULL, '2025-05-17 20:34:31.666921+07', NULL);
INSERT INTO public.audit_log VALUES (104, false, '2025-05-17 19:48:52.40006+07', '2025-05-17 19:48:52.401068+07', 'UPDATE', 'products.product', '10', '{"id": 10, "name": "Product Name", "slug": "fdsfdg", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": false, "meta_title": "", "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": ""}', '{"id": 10, "name": "Product Name", "slug": "fdsfdg", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": false, "meta_title": "", "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": ""}', NULL, '2025-05-17 19:48:52.402062+07', NULL);
INSERT INTO public.audit_log VALUES (129, false, '2025-05-17 20:47:10.422854+07', '2025-05-17 20:47:10.422854+07', 'CREATE', 'content.footercategory', '1', '{"id": 1, "name": "Về chúng tôi", "is_active": null, "created_by": null, "is_deleted": false, "updated_by": null, "display_order": 1}', '{"id": 1, "name": "Về chúng tôi", "is_active": null, "created_by": null, "is_deleted": false, "updated_by": null, "display_order": 1}', NULL, '2025-05-17 20:47:10.423846+07', NULL);
INSERT INTO public.audit_log VALUES (64, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'products.brand', '1', '{"id": 1, "name": "Citizen", "slug": null, "is_active": null, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": "Citizen is a Japanese watch manufacturer.", "display_order": null, "meta_description": null}', '{"id": 1, "name": "Citizen", "slug": null, "is_active": null, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": "Citizen is a Japanese watch manufacturer.", "display_order": null, "meta_description": null}', NULL, '2025-05-16 16:38:55.893998+07', NULL);
INSERT INTO public.audit_log VALUES (105, false, '2025-05-17 19:49:12.546695+07', '2025-05-17 19:49:12.546695+07', 'UPDATE', 'products.product', '11', '{"id": 11, "name": "gdfdsf", "slug": "fđfgfdgfg", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 75465465.0, "created_by": null, "is_deleted": false, "meta_title": "", "updated_by": null, "description": "gfđsfdsf", "is_featured": false, "warranty_period": 43, "meta_description": ""}', '{"id": 11, "name": "gdfdsf", "slug": "fđfgfdgfg", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 75465465.0, "created_by": null, "is_deleted": false, "meta_title": "", "updated_by": null, "description": "gfđsfdsf", "is_featured": false, "warranty_period": 43, "meta_description": ""}', NULL, '2025-05-17 19:49:12.547709+07', NULL);
INSERT INTO public.audit_log VALUES (130, false, '2025-05-17 20:49:38.188379+07', '2025-05-17 20:49:38.188379+07', 'CREATE', 'content.footerlink', '1', '{"id": 1, "url": "/about", "title": "duong dan", "category": "FooterCategory object (1)", "is_active": null, "created_by": null, "is_deleted": false, "updated_by": null, "display_order": 1}', '{"id": 1, "url": "/about", "title": "duong dan", "category": "FooterCategory object (1)", "is_active": null, "created_by": null, "is_deleted": false, "updated_by": null, "display_order": 1}', NULL, '2025-05-17 20:49:38.188379+07', NULL);
INSERT INTO public.audit_log VALUES (106, false, '2025-05-17 19:49:17.637128+07', '2025-05-17 19:49:17.637128+07', 'UPDATE', 'products.product', '10', '{"id": 10, "name": "Product Name", "slug": "fdsfdg", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": false, "meta_title": "", "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": ""}', '{"id": 10, "name": "Product Name", "slug": "fdsfdg", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": false, "meta_title": "", "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": ""}', NULL, '2025-05-17 19:49:17.638127+07', NULL);
INSERT INTO public.audit_log VALUES (131, false, '2025-05-17 21:07:23.735933+07', '2025-05-17 21:07:23.735933+07', 'UPDATE', 'content.footercategory', '1', '{"id": 1, "name": "Về chúng tôi", "is_active": null, "created_by": null, "is_deleted": false, "updated_by": null, "display_order": 1}', '{"id": 1, "name": "Về chúng tôi", "is_active": null, "created_by": null, "is_deleted": false, "updated_by": null, "display_order": 1}', NULL, '2025-05-17 21:07:23.737132+07', NULL);
INSERT INTO public.audit_log VALUES (107, false, '2025-05-17 19:49:22.003936+07', '2025-05-17 19:49:22.003936+07', 'UPDATE', 'products.product', '11', '{"id": 11, "name": "gdfdsf", "slug": "fđfgfdgfg", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 75465465.0, "created_by": null, "is_deleted": false, "meta_title": "", "updated_by": null, "description": "gfđsfdsf", "is_featured": false, "warranty_period": 43, "meta_description": ""}', '{"id": 11, "name": "gdfdsf", "slug": "fđfgfdgfg", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 75465465.0, "created_by": null, "is_deleted": false, "meta_title": "", "updated_by": null, "description": "gfđsfdsf", "is_featured": false, "warranty_period": 43, "meta_description": ""}', NULL, '2025-05-17 19:49:22.003936+07', NULL);
INSERT INTO public.audit_log VALUES (132, false, '2025-05-17 21:07:26.412586+07', '2025-05-17 21:07:26.412586+07', 'UPDATE', 'content.footercategory', '1', '{"id": 1, "name": "Về chúng tôi", "is_active": null, "created_by": null, "is_deleted": false, "updated_by": null, "display_order": 1}', '{"id": 1, "name": "Về chúng tôi", "is_active": null, "created_by": null, "is_deleted": false, "updated_by": null, "display_order": 1}', NULL, '2025-05-17 21:07:26.412586+07', NULL);
INSERT INTO public.audit_log VALUES (108, false, '2025-05-17 19:49:49.863856+07', '2025-05-17 19:49:49.863856+07', 'UPDATE', 'products.product', '12', '{"id": 12, "name": "patek philip", "slug": "ten-san-pham", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000000.0, "created_by": null, "is_deleted": false, "meta_title": "Meta title", "updated_by": null, "description": "Mô tả sản phẩm", "is_featured": true, "warranty_period": 12, "meta_description": "Meta description"}', '{"id": 12, "name": "patek philip", "slug": "ten-san-pham", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000000.0, "created_by": null, "is_deleted": false, "meta_title": "Meta title", "updated_by": null, "description": "Mô tả sản phẩm", "is_featured": true, "warranty_period": 12, "meta_description": "Meta description"}', NULL, '2025-05-17 19:49:49.863856+07', NULL);
INSERT INTO public.audit_log VALUES (133, false, '2025-05-17 21:09:43.430964+07', '2025-05-17 21:09:43.430964+07', 'UPDATE', 'content.footerlink', '1', '{"id": 1, "url": "/about", "title": "duong dan", "category": "FooterCategory object (1)", "is_active": null, "created_by": null, "is_deleted": false, "updated_by": null, "display_order": 1}', '{"id": 1, "url": "/about", "title": "duong dan", "category": "FooterCategory object (1)", "is_active": null, "created_by": null, "is_deleted": false, "updated_by": null, "display_order": 1}', NULL, '2025-05-17 21:09:43.430964+07', NULL);
INSERT INTO public.audit_log VALUES (36, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'auth.group', '4', '{"id": 4, "name": "Nhân viên 2"}', '{"id": 4, "name": "Nhân viên 2"}', NULL, '2025-05-15 13:40:02.075261+07', NULL);
INSERT INTO public.audit_log VALUES (109, false, '2025-05-17 19:50:10.641392+07', '2025-05-17 19:50:10.641392+07', 'UPDATE', 'products.product', '13', '{"id": 13, "name": "casio patek", "slug": "ten-san-ph", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000000.0, "created_by": null, "is_deleted": false, "meta_title": "Meta title", "updated_by": null, "description": "Mô tả sản phẩm", "is_featured": true, "warranty_period": 12, "meta_description": "Meta description"}', '{"id": 13, "name": "casio patek", "slug": "ten-san-ph", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000000.0, "created_by": null, "is_deleted": false, "meta_title": "Meta title", "updated_by": null, "description": "Mô tả sản phẩm", "is_featured": true, "warranty_period": 12, "meta_description": "Meta description"}', NULL, '2025-05-17 19:50:10.641392+07', NULL);
INSERT INTO public.audit_log VALUES (134, false, '2025-05-17 21:15:01.540619+07', '2025-05-17 21:15:01.540619+07', 'UPDATE', 'content.footerlink', '1', '{"id": 1, "url": "/about", "title": "duong dan", "category": "FooterCategory object (1)", "is_active": null, "created_by": null, "is_deleted": false, "updated_by": null, "display_order": 1}', '{"id": 1, "url": "/about", "title": "duong dan", "category": "FooterCategory object (1)", "is_active": null, "created_by": null, "is_deleted": false, "updated_by": null, "display_order": 1}', NULL, '2025-05-17 21:15:01.540619+07', NULL);
INSERT INTO public.audit_log VALUES (110, false, '2025-05-17 19:50:31.119133+07', '2025-05-17 19:50:31.119133+07', 'UPDATE', 'products.product', '14', '{"id": 14, "name": "rolex gold pre", "slug": "ten-san-", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000000.0, "created_by": null, "is_deleted": false, "meta_title": "Meta title", "updated_by": null, "description": "Mô tả sản phẩm", "is_featured": true, "warranty_period": 12, "meta_description": "Meta description"}', '{"id": 14, "name": "rolex gold pre", "slug": "ten-san-", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000000.0, "created_by": null, "is_deleted": false, "meta_title": "Meta title", "updated_by": null, "description": "Mô tả sản phẩm", "is_featured": true, "warranty_period": 12, "meta_description": "Meta description"}', NULL, '2025-05-17 19:50:31.120134+07', NULL);
INSERT INTO public.audit_log VALUES (135, false, '2025-05-17 21:15:03.394293+07', '2025-05-17 21:15:03.394293+07', 'UPDATE', 'content.footerlink', '1', '{"id": 1, "url": "/about", "title": "duong dan", "category": "FooterCategory object (1)", "is_active": null, "created_by": null, "is_deleted": false, "updated_by": null, "display_order": 1}', '{"id": 1, "url": "/about", "title": "duong dan", "category": "FooterCategory object (1)", "is_active": null, "created_by": null, "is_deleted": false, "updated_by": null, "display_order": 1}', NULL, '2025-05-17 21:15:03.394293+07', NULL);
INSERT INTO public.audit_log VALUES (55, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'auth.group', '2', '{"id": 2, "name": "Quản lý"}', '{"id": 2, "name": "Quản lý"}', NULL, '2025-05-16 15:17:23.92489+07', NULL);
INSERT INTO public.audit_log VALUES (111, false, '2025-05-17 19:51:02.490998+07', '2025-05-17 19:51:02.490998+07', 'UPDATE', 'products.product', '16', '{"id": 16, "name": "reolox platinum", "slug": "ten-sa", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000000.0, "created_by": null, "is_deleted": false, "meta_title": "Meta title", "updated_by": null, "description": "Mô tả sản phẩm", "is_featured": true, "warranty_period": 12, "meta_description": "Meta description"}', '{"id": 16, "name": "reolox platinum", "slug": "ten-sa", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000000.0, "created_by": null, "is_deleted": false, "meta_title": "Meta title", "updated_by": null, "description": "Mô tả sản phẩm", "is_featured": true, "warranty_period": 12, "meta_description": "Meta description"}', NULL, '2025-05-17 19:51:02.491509+07', NULL);
INSERT INTO public.audit_log VALUES (136, false, '2025-05-17 21:15:19.013894+07', '2025-05-17 21:15:19.013894+07', 'CREATE', 'content.footercategory', '2', '{"id": 2, "name": "Thông tin liên hệ", "is_active": true, "created_by": null, "is_deleted": false, "updated_by": null, "display_order": 2}', '{"id": 2, "name": "Thông tin liên hệ", "is_active": true, "created_by": null, "is_deleted": false, "updated_by": null, "display_order": 2}', NULL, '2025-05-17 21:15:19.014899+07', NULL);
INSERT INTO public.audit_log VALUES (112, false, '2025-05-17 19:51:25.210693+07', '2025-05-17 19:51:25.210693+07', 'UPDATE', 'products.product', '11', '{"id": 11, "name": "casio smart", "slug": "fđfgfdgfg", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 7546546.0, "created_by": null, "is_deleted": false, "meta_title": "", "updated_by": null, "description": "gfđsfdsf", "is_featured": false, "warranty_period": 43, "meta_description": ""}', '{"id": 11, "name": "casio smart", "slug": "fđfgfdgfg", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 7546546.0, "created_by": null, "is_deleted": false, "meta_title": "", "updated_by": null, "description": "gfđsfdsf", "is_featured": false, "warranty_period": 43, "meta_description": ""}', NULL, '2025-05-17 19:51:25.210693+07', NULL);
INSERT INTO public.audit_log VALUES (137, false, '2025-05-17 21:15:21.969244+07', '2025-05-17 21:15:21.969244+07', 'UPDATE', 'content.footercategory', '1', '{"id": 1, "name": "Về chúng tôi", "is_active": null, "created_by": null, "is_deleted": false, "updated_by": null, "display_order": 1}', '{"id": 1, "name": "Về chúng tôi", "is_active": null, "created_by": null, "is_deleted": false, "updated_by": null, "display_order": 1}', NULL, '2025-05-17 21:15:21.969244+07', NULL);
INSERT INTO public.audit_log VALUES (113, false, '2025-05-17 19:51:47.88951+07', '2025-05-17 19:51:47.88951+07', 'UPDATE', 'products.product', '4', '{"id": 4, "name": "Đồng hồ Casio gold", "slug": "dsadsad", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": false, "base_price": 200000.0, "created_by": null, "is_deleted": false, "meta_title": "fdsf", "updated_by": null, "description": "", "is_featured": false, "warranty_period": 122, "meta_description": "fdsfdsf"}', '{"id": 4, "name": "Đồng hồ Casio gold", "slug": "dsadsad", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": false, "base_price": 200000.0, "created_by": null, "is_deleted": false, "meta_title": "fdsf", "updated_by": null, "description": "", "is_featured": false, "warranty_period": 122, "meta_description": "fdsfdsf"}', NULL, '2025-05-17 19:51:47.890494+07', NULL);
INSERT INTO public.audit_log VALUES (138, false, '2025-05-17 21:15:26.36423+07', '2025-05-17 21:15:26.36423+07', 'UPDATE', 'content.footercategory', '1', '{"id": 1, "name": "Về chúng tôi", "is_active": true, "created_by": null, "is_deleted": false, "updated_by": null, "display_order": 1}', '{"id": 1, "name": "Về chúng tôi", "is_active": true, "created_by": null, "is_deleted": false, "updated_by": null, "display_order": 1}', NULL, '2025-05-17 21:15:26.36423+07', NULL);
INSERT INTO public.audit_log VALUES (114, false, '2025-05-17 19:52:05.485119+07', '2025-05-17 19:52:05.485119+07', 'UPDATE', 'products.product', '7', '{"id": 7, "name": "casio silver", "slug": "12", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": false, "meta_title": "sds", "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": "fsad"}', '{"id": 7, "name": "casio silver", "slug": "12", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": false, "meta_title": "sds", "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": "fsad"}', NULL, '2025-05-17 19:52:05.486336+07', NULL);
INSERT INTO public.audit_log VALUES (139, false, '2025-05-17 21:15:50.760189+07', '2025-05-17 21:15:50.760189+07', 'UPDATE', 'content.footerlink', '1', '{"id": 1, "url": "/about", "title": "duong dan", "category": "FooterCategory object (1)", "is_active": null, "created_by": null, "is_deleted": false, "updated_by": null, "display_order": 1}', '{"id": 1, "url": "/about", "title": "duong dan", "category": "FooterCategory object (1)", "is_active": null, "created_by": null, "is_deleted": false, "updated_by": null, "display_order": 1}', NULL, '2025-05-17 21:15:50.760189+07', NULL);
INSERT INTO public.audit_log VALUES (7, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'auth.group', '2', '{"id": 2, "name": "Quản lý"}', '{"id": 2, "name": "Quản lý"}', NULL, '2025-05-14 14:52:46.223203+07', NULL);
INSERT INTO public.audit_log VALUES (115, false, '2025-05-17 19:52:19.546405+07', '2025-05-17 19:52:19.546405+07', 'UPDATE', 'products.product', '10', '{"id": 10, "name": "patek philip limited", "slug": "fdsfdg", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": false, "meta_title": "", "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": ""}', '{"id": 10, "name": "patek philip limited", "slug": "fdsfdg", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": false, "meta_title": "", "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": ""}', NULL, '2025-05-17 19:52:19.547407+07', NULL);
INSERT INTO public.audit_log VALUES (140, false, '2025-05-17 21:16:20.956199+07', '2025-05-17 21:16:20.956199+07', 'CREATE', 'content.footerlink', '2', '{"id": 2, "url": "/diachi", "title": "dia chi", "category": "FooterCategory object (2)", "is_active": true, "created_by": null, "is_deleted": false, "updated_by": null, "display_order": 1}', '{"id": 2, "url": "/diachi", "title": "dia chi", "category": "FooterCategory object (2)", "is_active": true, "created_by": null, "is_deleted": false, "updated_by": null, "display_order": 1}', NULL, '2025-05-17 21:16:20.957198+07', NULL);
INSERT INTO public.audit_log VALUES (116, false, '2025-05-17 19:52:35.354006+07', '2025-05-17 19:52:35.354006+07', 'UPDATE', 'products.product', '6', '{"id": 6, "name": "Đồng hồ Casio diamond", "slug": "32", "brand": "Brand object (1)", "category": "Category object (2)", "is_active": false, "base_price": 200000.0, "created_by": null, "is_deleted": false, "meta_title": "fdsfd", "updated_by": null, "description": "", "is_featured": false, "warranty_period": 12, "meta_description": "fdsf"}', '{"id": 6, "name": "Đồng hồ Casio diamond", "slug": "32", "brand": "Brand object (1)", "category": "Category object (2)", "is_active": false, "base_price": 200000.0, "created_by": null, "is_deleted": false, "meta_title": "fdsfd", "updated_by": null, "description": "", "is_featured": false, "warranty_period": 12, "meta_description": "fdsf"}', NULL, '2025-05-17 19:52:35.354006+07', NULL);
INSERT INTO public.audit_log VALUES (141, false, '2025-05-17 21:18:17.969503+07', '2025-05-17 21:18:17.969503+07', 'CREATE', 'content.footerlink', '3', '{"id": 3, "url": "/baohanh", "title": "bao hanh", "category": "FooterCategory object (1)", "is_active": true, "created_by": null, "is_deleted": false, "updated_by": null, "display_order": 2}', '{"id": 3, "url": "/baohanh", "title": "bao hanh", "category": "FooterCategory object (1)", "is_active": true, "created_by": null, "is_deleted": false, "updated_by": null, "display_order": 2}', NULL, '2025-05-17 21:18:17.969503+07', NULL);
INSERT INTO public.audit_log VALUES (117, false, '2025-05-17 19:52:58.768378+07', '2025-05-17 19:52:58.768378+07', 'UPDATE', 'products.product', '8', '{"id": 8, "name": "henz quiz ta", "slug": "ds", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": false, "meta_title": "", "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": ""}', '{"id": 8, "name": "henz quiz ta", "slug": "ds", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": false, "meta_title": "", "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": ""}', NULL, '2025-05-17 19:52:58.769378+07', NULL);
INSERT INTO public.audit_log VALUES (44, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'DELETE', 'sessions.session', 'thostn7xvbuv1674iu3adfabotl1osu9', '{"expire_date": "2025-05-28T09:29:21.878892+00:00", "session_key": "thostn7xvbuv1674iu3adfabotl1osu9", "session_data": ".eJxVjDsOwjAQBe_iGln-ZO2Ykp4zWLveNQ6gRMqnQtwdIqWA9s3Me6mM29rytsicB1ZnZdXpdyMsDxl3wHccb5Mu07jOA-ld0Qdd9HVieV4O9--g4dK-NXHHAJZi9B6RqkviUoJQqrUQTYyGxKJhUwJ0UjvogzhfvGdjqQej3h_e2Ddi:1uF8QT:pR8r4McqR6FdEChg146KzTwOz9II4aygnEG3dkudJIM"}', NULL, NULL, '2025-05-15 14:35:38.024325+07', NULL);
INSERT INTO public.audit_log VALUES (118, false, '2025-05-17 19:53:39.552866+07', '2025-05-17 19:53:39.552866+07', 'UPDATE', 'products.product', '17', '{"id": 17, "name": "Patek Philip Diamond", "slug": "gfhgfh", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 546545.0, "created_by": null, "is_deleted": false, "meta_title": "", "updated_by": null, "description": "gdfgfdg", "is_featured": false, "warranty_period": 45, "meta_description": ""}', '{"id": 17, "name": "Patek Philip Diamond", "slug": "gfhgfh", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 546545.0, "created_by": null, "is_deleted": false, "meta_title": "", "updated_by": null, "description": "gdfgfdg", "is_featured": false, "warranty_period": 45, "meta_description": ""}', NULL, '2025-05-17 19:53:39.552866+07', NULL);
INSERT INTO public.audit_log VALUES (119, false, '2025-05-17 19:54:03.906342+07', '2025-05-17 19:54:03.906342+07', 'UPDATE', 'products.product', '9', '{"id": 9, "name": "Casio Sport", "slug": "fg", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": false, "meta_title": "", "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": ""}', '{"id": 9, "name": "Casio Sport", "slug": "fg", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": false, "meta_title": "", "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": ""}', NULL, '2025-05-17 19:54:03.906342+07', NULL);
INSERT INTO public.audit_log VALUES (120, false, '2025-05-17 19:54:30.406441+07', '2025-05-17 19:54:30.406441+07', 'UPDATE', 'products.product', '5', '{"id": 5, "name": "Đồng hồ Casio chất", "slug": "4234", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": false, "base_price": 200000.0, "created_by": null, "is_deleted": false, "meta_title": "fdsfd", "updated_by": null, "description": "", "is_featured": false, "warranty_period": 12, "meta_description": "dsfdsf"}', '{"id": 5, "name": "Đồng hồ Casio chất", "slug": "4234", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": false, "base_price": 200000.0, "created_by": null, "is_deleted": false, "meta_title": "fdsfd", "updated_by": null, "description": "", "is_featured": false, "warranty_period": 12, "meta_description": "dsfdsf"}', NULL, '2025-05-17 19:54:30.407443+07', NULL);
INSERT INTO public.audit_log VALUES (121, false, '2025-05-17 19:55:00.710429+07', '2025-05-17 19:55:00.710429+07', 'UPDATE', 'products.product', '3', '{"id": 3, "name": "Nhieu dong ho", "slug": "dfsdfgf", "brand": "Brand object (1)", "category": "Category object (2)", "is_active": true, "base_price": 1000000.0, "created_by": null, "is_deleted": false, "meta_title": "", "updated_by": null, "description": "", "is_featured": false, "warranty_period": 32, "meta_description": ""}', '{"id": 3, "name": "Nhieu dong ho", "slug": "dfsdfgf", "brand": "Brand object (1)", "category": "Category object (2)", "is_active": true, "base_price": 1000000.0, "created_by": null, "is_deleted": false, "meta_title": "", "updated_by": null, "description": "", "is_featured": false, "warranty_period": 32, "meta_description": ""}', NULL, '2025-05-17 19:55:00.711409+07', NULL);
INSERT INTO public.audit_log VALUES (5, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'auth.group', '1', '{"id": 1, "name": "Nhân viên"}', '{"id": 1, "name": "Nhân viên"}', NULL, '2025-05-14 14:52:08.515127+07', NULL);
INSERT INTO public.audit_log VALUES (56, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'auth.group', '5', '{"id": 5, "name": "Nhân viên 3"}', '{"id": 5, "name": "Nhân viên 3"}', NULL, '2025-05-16 15:18:20.262937+07', NULL);
INSERT INTO public.audit_log VALUES (75, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'DELETE', 'products.product', '1', '{"id": 1, "name": "dong", "slug": null, "brand": null, "category": null, "is_active": true, "base_price": 100000.0, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": "<fdssds", "is_featured": null, "warranty_period": null, "meta_description": null}', NULL, NULL, '2025-05-16 17:30:51.850968+07', NULL);
INSERT INTO public.audit_log VALUES (2, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'sessions.session', '5mublk8mzj3c4qarrioscr1bfjdw8jqv', '{"expire_date": "2025-05-28T07:45:06.781571+00:00", "session_key": "5mublk8mzj3c4qarrioscr1bfjdw8jqv", "session_data": "e30:1uF6na:nHkHBZ_GqT-qOwQAV3xiJRUShHGsOx26GwgcgGf_n4g"}', '{"expire_date": "2025-05-28T07:45:06.781571+00:00", "session_key": "5mublk8mzj3c4qarrioscr1bfjdw8jqv", "session_data": "e30:1uF6na:nHkHBZ_GqT-qOwQAV3xiJRUShHGsOx26GwgcgGf_n4g"}', NULL, '2025-05-14 14:45:06.794832+07', NULL);
INSERT INTO public.audit_log VALUES (54, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'DELETE', 'users.useraccount', '2', '{"id": 2, "email": "duc@gmail.com", "is_staff": true, "password": "pbkdf2_sha256$720000$AMz3cMql60MCP9fN7lNGpZ$7xEuMmq2h6UaIEQf7sHRsvd2l9ocjumKd3oETZC1Bx4=", "username": "đức", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', NULL, NULL, '2025-05-16 15:07:35.535737+07', NULL);
INSERT INTO public.audit_log VALUES (1, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'users.useraccount', '1', '{"id": 1, "email": "", "is_staff": true, "password": "pbkdf2_sha256$720000$NDeN2eKuwy5X0VM716fgSd$KZTYQduUnBC8XjxjQSNrdbQFTFcsKHBFhtKfyo+HZXw=", "username": "admin", "is_active": true, "last_login": null, "is_superuser": true, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 1, "email": "", "is_staff": true, "password": "pbkdf2_sha256$720000$NDeN2eKuwy5X0VM716fgSd$KZTYQduUnBC8XjxjQSNrdbQFTFcsKHBFhtKfyo+HZXw=", "username": "admin", "is_active": true, "last_login": null, "is_superuser": true, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-14 14:35:49.759072+07', NULL);
INSERT INTO public.audit_log VALUES (3, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'users.useraccount', '1', '{"id": 1, "email": "", "is_staff": true, "password": "pbkdf2_sha256$720000$NDeN2eKuwy5X0VM716fgSd$KZTYQduUnBC8XjxjQSNrdbQFTFcsKHBFhtKfyo+HZXw=", "username": "admin", "is_active": true, "last_login": "2025-05-14T07:45:06.802818+00:00", "is_superuser": true, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 1, "email": "", "is_staff": true, "password": "pbkdf2_sha256$720000$NDeN2eKuwy5X0VM716fgSd$KZTYQduUnBC8XjxjQSNrdbQFTFcsKHBFhtKfyo+HZXw=", "username": "admin", "is_active": true, "last_login": "2025-05-14T07:45:06.802818+00:00", "is_superuser": true, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-14 14:45:06.809398+07', NULL);
INSERT INTO public.audit_log VALUES (4, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'sessions.session', '5mublk8mzj3c4qarrioscr1bfjdw8jqv', '{"expire_date": "2025-05-28T07:45:06.813446+00:00", "session_key": "5mublk8mzj3c4qarrioscr1bfjdw8jqv", "session_data": ".eJxVjDsOwjAQBe_iGln-ZO2Ykp4zWLveNQ6gRMqnQtwdIqWA9s3Me6mM29rytsicB1ZnZdXpdyMsDxl3wHccb5Mu07jOA-ld0Qdd9HVieV4O9--g4dK-NXHHAJZi9B6RqkviUoJQqrUQTYyGxKJhUwJ0UjvogzhfvGdjqQej3h_e2Ddi:1uF6na:QsBtRy2ZHv8jCoCRM1ugSGiXVWULaiLU_4eM0KpQ2Sg"}', '{"expire_date": "2025-05-28T07:45:06.813446+00:00", "session_key": "5mublk8mzj3c4qarrioscr1bfjdw8jqv", "session_data": ".eJxVjDsOwjAQBe_iGln-ZO2Ykp4zWLveNQ6gRMqnQtwdIqWA9s3Me6mM29rytsicB1ZnZdXpdyMsDxl3wHccb5Mu07jOA-ld0Qdd9HVieV4O9--g4dK-NXHHAJZi9B6RqkviUoJQqrUQTYyGxKJhUwJ0UjvogzhfvGdjqQej3h_e2Ddi:1uF6na:QsBtRy2ZHv8jCoCRM1ugSGiXVWULaiLU_4eM0KpQ2Sg"}', NULL, '2025-05-14 14:45:06.81743+07', NULL);
INSERT INTO public.audit_log VALUES (6, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'admin.logentry', '1', '{"id": 1, "user": "admin", "object_id": "1", "action_flag": 1, "action_time": "2025-05-14T07:52:08.533624+00:00", "object_repr": "Nhân viên", "content_type": "Authentication and Authorization | group", "change_message": "[{\"added\": {}}]"}', '{"id": 1, "user": "admin", "object_id": "1", "action_flag": 1, "action_time": "2025-05-14T07:52:08.533624+00:00", "object_repr": "Nhân viên", "content_type": "Authentication and Authorization | group", "change_message": "[{\"added\": {}}]"}', NULL, '2025-05-14 14:52:08.546641+07', NULL);
INSERT INTO public.audit_log VALUES (8, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'admin.logentry', '2', '{"id": 2, "user": "admin", "object_id": "2", "action_flag": 1, "action_time": "2025-05-14T07:52:46.242608+00:00", "object_repr": "Quản lý", "content_type": "Authentication and Authorization | group", "change_message": "[{\"added\": {}}]"}', '{"id": 2, "user": "admin", "object_id": "2", "action_flag": 1, "action_time": "2025-05-14T07:52:46.242608+00:00", "object_repr": "Quản lý", "content_type": "Authentication and Authorization | group", "change_message": "[{\"added\": {}}]"}', NULL, '2025-05-14 14:52:46.253608+07', NULL);
INSERT INTO public.audit_log VALUES (9, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'users.useraccount', '2', '{"id": 2, "email": "duc@gmail.com", "is_staff": true, "password": "pbkdf2_sha256$720000$AMz3cMql60MCP9fN7lNGpZ$7xEuMmq2h6UaIEQf7sHRsvd2l9ocjumKd3oETZC1Bx4=", "username": "đức", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 2, "email": "duc@gmail.com", "is_staff": true, "password": "pbkdf2_sha256$720000$AMz3cMql60MCP9fN7lNGpZ$7xEuMmq2h6UaIEQf7sHRsvd2l9ocjumKd3oETZC1Bx4=", "username": "đức", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-14 14:53:57.543188+07', NULL);
INSERT INTO public.audit_log VALUES (10, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'users.useraccount', '3', '{"id": 3, "email": "dudc@gmail.com", "is_staff": true, "password": "pbkdf2_sha256$720000$3fA5C977xUe2vJbTJfpaoV$BHiVG8Nc19c8YWoRqnC1JU+TdYL5hJcqK35tBeqUB9o=", "username": "duc", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 3, "email": "dudc@gmail.com", "is_staff": true, "password": "pbkdf2_sha256$720000$3fA5C977xUe2vJbTJfpaoV$BHiVG8Nc19c8YWoRqnC1JU+TdYL5hJcqK35tBeqUB9o=", "username": "duc", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-14 15:13:15.789694+07', NULL);
INSERT INTO public.audit_log VALUES (11, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'auth.group', '1', '{"id": 1, "name": "Nhân viên"}', '{"id": 1, "name": "Nhân viên"}', NULL, '2025-05-14 15:26:48.439144+07', NULL);
INSERT INTO public.audit_log VALUES (12, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'admin.logentry', '3', '{"id": 3, "user": "admin", "object_id": "1", "action_flag": 2, "action_time": "2025-05-14T08:26:48.452523+00:00", "object_repr": "Nhân viên", "content_type": "Authentication and Authorization | group", "change_message": "[]"}', '{"id": 3, "user": "admin", "object_id": "1", "action_flag": 2, "action_time": "2025-05-14T08:26:48.452523+00:00", "object_repr": "Nhân viên", "content_type": "Authentication and Authorization | group", "change_message": "[]"}', NULL, '2025-05-14 15:26:48.46052+07', NULL);
INSERT INTO public.audit_log VALUES (13, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'DELETE', 'sessions.session', '5mublk8mzj3c4qarrioscr1bfjdw8jqv', '{"expire_date": "2025-05-28T07:45:06.813446+00:00", "session_key": "5mublk8mzj3c4qarrioscr1bfjdw8jqv", "session_data": ".eJxVjDsOwjAQBe_iGln-ZO2Ykp4zWLveNQ6gRMqnQtwdIqWA9s3Me6mM29rytsicB1ZnZdXpdyMsDxl3wHccb5Mu07jOA-ld0Qdd9HVieV4O9--g4dK-NXHHAJZi9B6RqkviUoJQqrUQTYyGxKJhUwJ0UjvogzhfvGdjqQej3h_e2Ddi:1uF6na:QsBtRy2ZHv8jCoCRM1ugSGiXVWULaiLU_4eM0KpQ2Sg"}', NULL, NULL, '2025-05-14 15:53:13.939946+07', NULL);
INSERT INTO public.audit_log VALUES (14, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'sessions.session', 'g8jalvmibspz8p33d0tiww7vsbvsem6p', '{"expire_date": "2025-05-28T08:53:19.350920+00:00", "session_key": "g8jalvmibspz8p33d0tiww7vsbvsem6p", "session_data": "e30:1uF7rb:h4fsxt3veVRcb5hkkYQoAjNnKWT1bJf3x7uTCeK1aaA"}', '{"expire_date": "2025-05-28T08:53:19.350920+00:00", "session_key": "g8jalvmibspz8p33d0tiww7vsbvsem6p", "session_data": "e30:1uF7rb:h4fsxt3veVRcb5hkkYQoAjNnKWT1bJf3x7uTCeK1aaA"}', NULL, '2025-05-14 15:53:19.358378+07', NULL);
INSERT INTO public.audit_log VALUES (66, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'products.category', '1', '{"id": 1, "name": "Smart Watches", "slug": null, "parent": null, "is_active": null, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": "Modern smart watches with advanced features", "display_order": null, "meta_description": null}', '{"id": 1, "name": "Smart Watches", "slug": null, "parent": null, "is_active": null, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": "Modern smart watches with advanced features", "display_order": null, "meta_description": null}', NULL, '2025-05-16 16:40:22.033955+07', NULL);
INSERT INTO public.audit_log VALUES (15, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'users.useraccount', '3', '{"id": 3, "email": "dudc@gmail.com", "is_staff": true, "password": "pbkdf2_sha256$720000$3fA5C977xUe2vJbTJfpaoV$BHiVG8Nc19c8YWoRqnC1JU+TdYL5hJcqK35tBeqUB9o=", "username": "duc", "is_active": true, "last_login": "2025-05-14T08:53:19.362155+00:00", "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 3, "email": "dudc@gmail.com", "is_staff": true, "password": "pbkdf2_sha256$720000$3fA5C977xUe2vJbTJfpaoV$BHiVG8Nc19c8YWoRqnC1JU+TdYL5hJcqK35tBeqUB9o=", "username": "duc", "is_active": true, "last_login": "2025-05-14T08:53:19.362155+00:00", "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-14 15:53:19.36771+07', NULL);
INSERT INTO public.audit_log VALUES (16, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'sessions.session', 'g8jalvmibspz8p33d0tiww7vsbvsem6p', '{"expire_date": "2025-05-28T08:53:19.377704+00:00", "session_key": "g8jalvmibspz8p33d0tiww7vsbvsem6p", "session_data": ".eJxVjMsOwiAUBf-FtSEghSsu3fsNDdyHVA0kpV0Z_12bdKHbMzPnpca0LmVcO8_jROqsnDr8bjnhg-sG6J7qrWlsdZmnrDdF77TrayN-Xnb376CkXr51RhGKhj0nEo4mAzh2wvkU4mAB0MsQhIABU_QMziMax_boxVuDQb0_I9k43Q:1uF7rb:9GQDqwsdozHjACfsxe0cpNmd73RM9QZEWnZu8l3kA-E"}', '{"expire_date": "2025-05-28T08:53:19.377704+00:00", "session_key": "g8jalvmibspz8p33d0tiww7vsbvsem6p", "session_data": ".eJxVjMsOwiAUBf-FtSEghSsu3fsNDdyHVA0kpV0Z_12bdKHbMzPnpca0LmVcO8_jROqsnDr8bjnhg-sG6J7qrWlsdZmnrDdF77TrayN-Xnb376CkXr51RhGKhj0nEo4mAzh2wvkU4mAB0MsQhIABU_QMziMax_boxVuDQb0_I9k43Q:1uF7rb:9GQDqwsdozHjACfsxe0cpNmd73RM9QZEWnZu8l3kA-E"}', NULL, '2025-05-14 15:53:19.383706+07', NULL);
INSERT INTO public.audit_log VALUES (17, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'DELETE', 'sessions.session', 'g8jalvmibspz8p33d0tiww7vsbvsem6p', '{"expire_date": "2025-05-28T08:53:19.377704+00:00", "session_key": "g8jalvmibspz8p33d0tiww7vsbvsem6p", "session_data": ".eJxVjMsOwiAUBf-FtSEghSsu3fsNDdyHVA0kpV0Z_12bdKHbMzPnpca0LmVcO8_jROqsnDr8bjnhg-sG6J7qrWlsdZmnrDdF77TrayN-Xnb376CkXr51RhGKhj0nEo4mAzh2wvkU4mAB0MsQhIABU_QMziMax_boxVuDQb0_I9k43Q:1uF7rb:9GQDqwsdozHjACfsxe0cpNmd73RM9QZEWnZu8l3kA-E"}', NULL, NULL, '2025-05-14 15:53:22.017384+07', NULL);
INSERT INTO public.audit_log VALUES (18, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'sessions.session', 'd0p15ika2uq0kusbji11us88k62v3i0n', '{"expire_date": "2025-05-28T08:53:27.190122+00:00", "session_key": "d0p15ika2uq0kusbji11us88k62v3i0n", "session_data": "e30:1uF7rj:WBS0RlO6-7lp2X-cJdh6iucLym36_IbnXBB_4vhp27E"}', '{"expire_date": "2025-05-28T08:53:27.190122+00:00", "session_key": "d0p15ika2uq0kusbji11us88k62v3i0n", "session_data": "e30:1uF7rj:WBS0RlO6-7lp2X-cJdh6iucLym36_IbnXBB_4vhp27E"}', NULL, '2025-05-14 15:53:27.194154+07', NULL);
INSERT INTO public.audit_log VALUES (19, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'users.useraccount', '1', '{"id": 1, "email": "", "is_staff": true, "password": "pbkdf2_sha256$720000$NDeN2eKuwy5X0VM716fgSd$KZTYQduUnBC8XjxjQSNrdbQFTFcsKHBFhtKfyo+HZXw=", "username": "admin", "is_active": true, "last_login": "2025-05-14T08:53:27.201132+00:00", "is_superuser": true, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 1, "email": "", "is_staff": true, "password": "pbkdf2_sha256$720000$NDeN2eKuwy5X0VM716fgSd$KZTYQduUnBC8XjxjQSNrdbQFTFcsKHBFhtKfyo+HZXw=", "username": "admin", "is_active": true, "last_login": "2025-05-14T08:53:27.201132+00:00", "is_superuser": true, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-14 15:53:27.206166+07', NULL);
INSERT INTO public.audit_log VALUES (20, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'sessions.session', 'd0p15ika2uq0kusbji11us88k62v3i0n', '{"expire_date": "2025-05-28T08:53:27.207110+00:00", "session_key": "d0p15ika2uq0kusbji11us88k62v3i0n", "session_data": ".eJxVjDsOwjAQBe_iGln-ZO2Ykp4zWLveNQ6gRMqnQtwdIqWA9s3Me6mM29rytsicB1ZnZdXpdyMsDxl3wHccb5Mu07jOA-ld0Qdd9HVieV4O9--g4dK-NXHHAJZi9B6RqkviUoJQqrUQTYyGxKJhUwJ0UjvogzhfvGdjqQej3h_e2Ddi:1uF7rj:Q6LOLDxc-QSSTA5xpQboWAlC42gULDeQ6BNV_oPUOzY"}', '{"expire_date": "2025-05-28T08:53:27.207110+00:00", "session_key": "d0p15ika2uq0kusbji11us88k62v3i0n", "session_data": ".eJxVjDsOwjAQBe_iGln-ZO2Ykp4zWLveNQ6gRMqnQtwdIqWA9s3Me6mM29rytsicB1ZnZdXpdyMsDxl3wHccb5Mu07jOA-ld0Qdd9HVieV4O9--g4dK-NXHHAJZi9B6RqkviUoJQqrUQTYyGxKJhUwJ0UjvogzhfvGdjqQej3h_e2Ddi:1uF7rj:Q6LOLDxc-QSSTA5xpQboWAlC42gULDeQ6BNV_oPUOzY"}', NULL, '2025-05-14 15:53:27.212205+07', NULL);
INSERT INTO public.audit_log VALUES (21, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'admin.logentry', '4', '{"id": 4, "user": "admin", "object_id": "1", "action_flag": 3, "action_time": "2025-05-14T08:54:09.357169+00:00", "object_repr": "Nhân viên", "content_type": "Authentication and Authorization | group", "change_message": ""}', '{"id": 4, "user": "admin", "object_id": "1", "action_flag": 3, "action_time": "2025-05-14T08:54:09.357169+00:00", "object_repr": "Nhân viên", "content_type": "Authentication and Authorization | group", "change_message": ""}', NULL, '2025-05-14 15:54:09.371923+07', NULL);
INSERT INTO public.audit_log VALUES (22, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'DELETE', 'auth.group', '1', '{"id": 1, "name": "Nhân viên"}', NULL, NULL, '2025-05-14 15:54:09.385926+07', NULL);
INSERT INTO public.audit_log VALUES (23, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'auth.group', '3', '{"id": 3, "name": "Nhân viên"}', '{"id": 3, "name": "Nhân viên"}', NULL, '2025-05-14 15:54:26.051112+07', NULL);
INSERT INTO public.audit_log VALUES (24, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'admin.logentry', '5', '{"id": 5, "user": "admin", "object_id": "3", "action_flag": 1, "action_time": "2025-05-14T08:54:26.065123+00:00", "object_repr": "Nhân viên", "content_type": "Authentication and Authorization | group", "change_message": "[{\"added\": {}}]"}', '{"id": 5, "user": "admin", "object_id": "3", "action_flag": 1, "action_time": "2025-05-14T08:54:26.065123+00:00", "object_repr": "Nhân viên", "content_type": "Authentication and Authorization | group", "change_message": "[{\"added\": {}}]"}', NULL, '2025-05-14 15:54:26.073135+07', NULL);
INSERT INTO public.audit_log VALUES (25, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'users.useraccount', '4', '{"id": 4, "email": "duddc@gmail.com", "is_staff": true, "password": "pbkdf2_sha256$720000$pTMqPaNlCbiby49HcJ0SJC$hHlKALDyGMlEYnFrTmJswDTCstpfgdV04W8iy7bafDc=", "username": "viet", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 4, "email": "duddc@gmail.com", "is_staff": true, "password": "pbkdf2_sha256$720000$pTMqPaNlCbiby49HcJ0SJC$hHlKALDyGMlEYnFrTmJswDTCstpfgdV04W8iy7bafDc=", "username": "viet", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-14 15:55:37.268221+07', NULL);
INSERT INTO public.audit_log VALUES (26, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'auth.group', '3', '{"id": 3, "name": "Nhân viên"}', '{"id": 3, "name": "Nhân viên"}', NULL, '2025-05-14 16:09:56.936857+07', NULL);
INSERT INTO public.audit_log VALUES (27, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'admin.logentry', '6', '{"id": 6, "user": "admin", "object_id": "3", "action_flag": 2, "action_time": "2025-05-14T09:09:56.943903+00:00", "object_repr": "Nhân viên", "content_type": "Authentication and Authorization | group", "change_message": "[]"}', '{"id": 6, "user": "admin", "object_id": "3", "action_flag": 2, "action_time": "2025-05-14T09:09:56.943903+00:00", "object_repr": "Nhân viên", "content_type": "Authentication and Authorization | group", "change_message": "[]"}', NULL, '2025-05-14 16:09:56.95341+07', NULL);
INSERT INTO public.audit_log VALUES (28, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'DELETE', 'sessions.session', 'd0p15ika2uq0kusbji11us88k62v3i0n', '{"expire_date": "2025-05-28T08:53:27.207110+00:00", "session_key": "d0p15ika2uq0kusbji11us88k62v3i0n", "session_data": ".eJxVjDsOwjAQBe_iGln-ZO2Ykp4zWLveNQ6gRMqnQtwdIqWA9s3Me6mM29rytsicB1ZnZdXpdyMsDxl3wHccb5Mu07jOA-ld0Qdd9HVieV4O9--g4dK-NXHHAJZi9B6RqkviUoJQqrUQTYyGxKJhUwJ0UjvogzhfvGdjqQej3h_e2Ddi:1uF7rj:Q6LOLDxc-QSSTA5xpQboWAlC42gULDeQ6BNV_oPUOzY"}', NULL, NULL, '2025-05-14 16:29:18.518245+07', NULL);
INSERT INTO public.audit_log VALUES (29, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'sessions.session', 'thostn7xvbuv1674iu3adfabotl1osu9', '{"expire_date": "2025-05-28T09:29:21.854342+00:00", "session_key": "thostn7xvbuv1674iu3adfabotl1osu9", "session_data": "e30:1uF8QT:HnPxmrGAXTNh4Yrbggoav-BYIOmsilPoyEBrLerh6eg"}', '{"expire_date": "2025-05-28T09:29:21.854342+00:00", "session_key": "thostn7xvbuv1674iu3adfabotl1osu9", "session_data": "e30:1uF8QT:HnPxmrGAXTNh4Yrbggoav-BYIOmsilPoyEBrLerh6eg"}', NULL, '2025-05-14 16:29:21.859356+07', NULL);
INSERT INTO public.audit_log VALUES (65, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'products.product', '6', '{"id": 6, "name": "Đồng hồ Casio", "slug": null, "brand": null, "category": null, "is_active": null, "base_price": 200000.0, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": null, "is_featured": null, "warranty_period": null, "meta_description": null}', '{"id": 6, "name": "Đồng hồ Casio", "slug": null, "brand": null, "category": null, "is_active": null, "base_price": 200000.0, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": null, "is_featured": null, "warranty_period": null, "meta_description": null}', NULL, '2025-05-16 16:39:11.817461+07', NULL);
INSERT INTO public.audit_log VALUES (30, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'users.useraccount', '1', '{"id": 1, "email": "", "is_staff": true, "password": "pbkdf2_sha256$720000$NDeN2eKuwy5X0VM716fgSd$KZTYQduUnBC8XjxjQSNrdbQFTFcsKHBFhtKfyo+HZXw=", "username": "admin", "is_active": true, "last_login": "2025-05-14T09:29:21.863338+00:00", "is_superuser": true, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 1, "email": "", "is_staff": true, "password": "pbkdf2_sha256$720000$NDeN2eKuwy5X0VM716fgSd$KZTYQduUnBC8XjxjQSNrdbQFTFcsKHBFhtKfyo+HZXw=", "username": "admin", "is_active": true, "last_login": "2025-05-14T09:29:21.863338+00:00", "is_superuser": true, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-14 16:29:21.872911+07', NULL);
INSERT INTO public.audit_log VALUES (31, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'sessions.session', 'thostn7xvbuv1674iu3adfabotl1osu9', '{"expire_date": "2025-05-28T09:29:21.878892+00:00", "session_key": "thostn7xvbuv1674iu3adfabotl1osu9", "session_data": ".eJxVjDsOwjAQBe_iGln-ZO2Ykp4zWLveNQ6gRMqnQtwdIqWA9s3Me6mM29rytsicB1ZnZdXpdyMsDxl3wHccb5Mu07jOA-ld0Qdd9HVieV4O9--g4dK-NXHHAJZi9B6RqkviUoJQqrUQTYyGxKJhUwJ0UjvogzhfvGdjqQej3h_e2Ddi:1uF8QT:pR8r4McqR6FdEChg146KzTwOz9II4aygnEG3dkudJIM"}', '{"expire_date": "2025-05-28T09:29:21.878892+00:00", "session_key": "thostn7xvbuv1674iu3adfabotl1osu9", "session_data": ".eJxVjDsOwjAQBe_iGln-ZO2Ykp4zWLveNQ6gRMqnQtwdIqWA9s3Me6mM29rytsicB1ZnZdXpdyMsDxl3wHccb5Mu07jOA-ld0Qdd9HVieV4O9--g4dK-NXHHAJZi9B6RqkviUoJQqrUQTYyGxKJhUwJ0UjvogzhfvGdjqQej3h_e2Ddi:1uF8QT:pR8r4McqR6FdEChg146KzTwOz9II4aygnEG3dkudJIM"}', NULL, '2025-05-14 16:29:21.880908+07', NULL);
INSERT INTO public.audit_log VALUES (32, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'users.useraccount', '4', '{"id": 4, "email": "dsad@gmail.com", "is_staff": true, "password": "pbkdf2_sha256$720000$pTMqPaNlCbiby49HcJ0SJC$hHlKALDyGMlEYnFrTmJswDTCstpfgdV04W8iy7bafDc=", "username": "viet", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 4, "email": "dsad@gmail.com", "is_staff": true, "password": "pbkdf2_sha256$720000$pTMqPaNlCbiby49HcJ0SJC$hHlKALDyGMlEYnFrTmJswDTCstpfgdV04W8iy7bafDc=", "username": "viet", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-14 16:32:43.437456+07', NULL);
INSERT INTO public.audit_log VALUES (33, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'products.product', '1', '{"id": 1, "name": "dong", "slug": null, "brand": null, "category": null, "is_active": true, "base_price": 100000.0, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": "<fdssds", "is_featured": null, "warranty_period": null, "meta_description": null}', '{"id": 1, "name": "dong", "slug": null, "brand": null, "category": null, "is_active": true, "base_price": 100000.0, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": "<fdssds", "is_featured": null, "warranty_period": null, "meta_description": null}', NULL, '2025-05-14 16:47:35.295208+07', NULL);
INSERT INTO public.audit_log VALUES (34, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'users.useraccount', '5', '{"id": 5, "email": "newuser@example.com", "is_staff": true, "password": "pbkdf2_sha256$720000$VHYY7HqRbtd6o34CAE5AqO$SV2yjHjskz+EKeI1uDbZ1SiF0YGX/mZhd3kV7bd9SsI=", "username": "newuser", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 5, "email": "newuser@example.com", "is_staff": true, "password": "pbkdf2_sha256$720000$VHYY7HqRbtd6o34CAE5AqO$SV2yjHjskz+EKeI1uDbZ1SiF0YGX/mZhd3kV7bd9SsI=", "username": "newuser", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-15 13:31:50.451858+07', NULL);
INSERT INTO public.audit_log VALUES (35, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'users.useraccount', '1', '{"id": 1, "email": "", "is_staff": true, "password": "pbkdf2_sha256$720000$2waB0HgMB7JbvlO0jotP2t$aqfDssDIP13ySoeWds8JDSeSImANVziae11fnJbIuMo=", "username": "admin", "is_active": true, "last_login": "2025-05-14T09:29:21.863338+00:00", "is_superuser": true, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 1, "email": "", "is_staff": true, "password": "pbkdf2_sha256$720000$2waB0HgMB7JbvlO0jotP2t$aqfDssDIP13ySoeWds8JDSeSImANVziae11fnJbIuMo=", "username": "admin", "is_active": true, "last_login": "2025-05-14T09:29:21.863338+00:00", "is_superuser": true, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-15 13:38:07.330301+07', NULL);
INSERT INTO public.audit_log VALUES (37, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'users.useraccount', '6', '{"id": 6, "email": "newguser@example.com", "is_staff": true, "password": "pbkdf2_sha256$720000$4uLDUFqKHEpGpDue124s3o$hDKBwqogK8euae01gU3uLuX6GI0a+RtUbCHty5XMlu8=", "username": "fnewuser", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 6, "email": "newguser@example.com", "is_staff": true, "password": "pbkdf2_sha256$720000$4uLDUFqKHEpGpDue124s3o$hDKBwqogK8euae01gU3uLuX6GI0a+RtUbCHty5XMlu8=", "username": "fnewuser", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-15 13:43:26.186439+07', NULL);
INSERT INTO public.audit_log VALUES (38, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'users.useraccount', '6', '{"id": 6, "email": "UvW@qWRuDWrkANNWrWYdATehZ.au", "is_staff": true, "password": "pbkdf2_sha256$720000$4uLDUFqKHEpGpDue124s3o$hDKBwqogK8euae01gU3uLuX6GI0a+RtUbCHty5XMlu8=", "username": "fdsfdsfgdsfs", "is_active": false, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 6, "email": "UvW@qWRuDWrkANNWrWYdATehZ.au", "is_staff": true, "password": "pbkdf2_sha256$720000$4uLDUFqKHEpGpDue124s3o$hDKBwqogK8euae01gU3uLuX6GI0a+RtUbCHty5XMlu8=", "username": "fdsfdsfgdsfs", "is_active": false, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-15 13:44:41.010931+07', NULL);
INSERT INTO public.audit_log VALUES (39, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'users.useraccount', '6', '{"id": 6, "email": "UvW@qWRuDWrkANNWrWYdATehZ.au", "is_staff": true, "password": "pbkdf2_sha256$720000$4uLDUFqKHEpGpDue124s3o$hDKBwqogK8euae01gU3uLuX6GI0a+RtUbCHty5XMlu8=", "username": "fdsfdsfgdsfs", "is_active": false, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 6, "email": "UvW@qWRuDWrkANNWrWYdATehZ.au", "is_staff": true, "password": "pbkdf2_sha256$720000$4uLDUFqKHEpGpDue124s3o$hDKBwqogK8euae01gU3uLuX6GI0a+RtUbCHty5XMlu8=", "username": "fdsfdsfgdsfs", "is_active": false, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-15 13:44:48.432762+07', NULL);
INSERT INTO public.audit_log VALUES (40, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'users.useraccount', '6', '{"id": 6, "email": "UvW@qWRuDWrkANNWrWYdATehZ.au", "is_staff": true, "password": "pbkdf2_sha256$720000$4uLDUFqKHEpGpDue124s3o$hDKBwqogK8euae01gU3uLuX6GI0a+RtUbCHty5XMlu8=", "username": "fdsfdsfgdsfs", "is_active": false, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 6, "email": "UvW@qWRuDWrkANNWrWYdATehZ.au", "is_staff": true, "password": "pbkdf2_sha256$720000$4uLDUFqKHEpGpDue124s3o$hDKBwqogK8euae01gU3uLuX6GI0a+RtUbCHty5XMlu8=", "username": "fdsfdsfgdsfs", "is_active": false, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-15 13:52:22.559911+07', NULL);
INSERT INTO public.audit_log VALUES (41, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'users.useraccount', '7', '{"id": 7, "email": "newdguser@example.com", "is_staff": true, "password": "pbkdf2_sha256$720000$9P9s8J8afLcuTDzyatHD90$OIEPYP9RP04mYoiJMgfi9gy/PQebvVn44XXL+JcEx8M=", "username": "fsewuser", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 7, "email": "newdguser@example.com", "is_staff": true, "password": "pbkdf2_sha256$720000$9P9s8J8afLcuTDzyatHD90$OIEPYP9RP04mYoiJMgfi9gy/PQebvVn44XXL+JcEx8M=", "username": "fsewuser", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-15 13:52:31.228863+07', NULL);
INSERT INTO public.audit_log VALUES (42, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'users.useraccount', '1', '{"id": 1, "email": "admin@gmail.com", "is_staff": true, "password": "pbkdf2_sha256$720000$2waB0HgMB7JbvlO0jotP2t$aqfDssDIP13ySoeWds8JDSeSImANVziae11fnJbIuMo=", "username": "admin", "is_active": true, "last_login": "2025-05-14T09:29:21.863338+00:00", "is_superuser": true, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 1, "email": "admin@gmail.com", "is_staff": true, "password": "pbkdf2_sha256$720000$2waB0HgMB7JbvlO0jotP2t$aqfDssDIP13ySoeWds8JDSeSImANVziae11fnJbIuMo=", "username": "admin", "is_active": true, "last_login": "2025-05-14T09:29:21.863338+00:00", "is_superuser": true, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-15 14:16:09.628646+07', NULL);
INSERT INTO public.audit_log VALUES (43, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'products.product', '2', '{"id": 2, "name": "Đồng hồ Casio", "slug": null, "brand": null, "category": null, "is_active": null, "base_price": 2000000.0, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": null, "is_featured": null, "warranty_period": null, "meta_description": null}', '{"id": 2, "name": "Đồng hồ Casio", "slug": null, "brand": null, "category": null, "is_active": null, "base_price": 2000000.0, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": null, "is_featured": null, "warranty_period": null, "meta_description": null}', NULL, '2025-05-15 14:17:47.862359+07', NULL);
INSERT INTO public.audit_log VALUES (45, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'products.product', '3', '{"id": 3, "name": "Đồng hồ Casio", "slug": null, "brand": null, "category": null, "is_active": null, "base_price": 200000.0, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": null, "is_featured": null, "warranty_period": null, "meta_description": null}', '{"id": 3, "name": "Đồng hồ Casio", "slug": null, "brand": null, "category": null, "is_active": null, "base_price": 200000.0, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": null, "is_featured": null, "warranty_period": null, "meta_description": null}', NULL, '2025-05-15 15:01:13.2103+07', NULL);
INSERT INTO public.audit_log VALUES (46, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'products.productvariant', '1', '{"id": 1, "sku": "VARIANT-001", "barcode": "123456789", "product": "Product object (3)", "is_active": true, "created_by": null, "is_deleted": null, "updated_by": null, "price_adjustment": 10.5, "stock_alert_threshold": 5}', '{"id": 1, "sku": "VARIANT-001", "barcode": "123456789", "product": "Product object (3)", "is_active": true, "created_by": null, "is_deleted": null, "updated_by": null, "price_adjustment": 10.5, "stock_alert_threshold": 5}', NULL, '2025-05-15 15:08:16.909699+07', NULL);
INSERT INTO public.audit_log VALUES (47, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'users.useraccount', '8', '{"id": 8, "email": "newfduser@example.com", "is_staff": true, "password": "pbkdf2_sha256$720000$CM6slT6GcsMLD5PMUWJToA$QgFwUwRRBLCHHKqEnPGSbFn0w3N/+sma8MryIGZImwc=", "username": "newuseffdr", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 8, "email": "newfduser@example.com", "is_staff": true, "password": "pbkdf2_sha256$720000$CM6slT6GcsMLD5PMUWJToA$QgFwUwRRBLCHHKqEnPGSbFn0w3N/+sma8MryIGZImwc=", "username": "newuseffdr", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-15 19:20:05.634133+07', NULL);
INSERT INTO public.audit_log VALUES (48, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'users.useraccount', '9', '{"id": 9, "email": "vitconcodon13@gmail.com", "is_staff": true, "password": "pbkdf2_sha256$720000$wQKbzrRWtqdDVP4pQVULvN$AcoDDAeVLx56i723cw9gL0lpjm1bie3vczQPucek7r4=", "username": "admindf", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 9, "email": "vitconcodon13@gmail.com", "is_staff": true, "password": "pbkdf2_sha256$720000$wQKbzrRWtqdDVP4pQVULvN$AcoDDAeVLx56i723cw9gL0lpjm1bie3vczQPucek7r4=", "username": "admindf", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-15 19:22:11.600331+07', NULL);
INSERT INTO public.audit_log VALUES (49, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'users.useraccount', '10', '{"id": 10, "email": "fdfdfgdf@gmail.com", "is_staff": true, "password": "pbkdf2_sha256$720000$pZ1Sss9GTFZTw1nk4RrG8I$50p7cgi7Q7FA8TapqrlBzqsyJfXs1ckbU0ssZJunCzw=", "username": "admin543", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 10, "email": "fdfdfgdf@gmail.com", "is_staff": true, "password": "pbkdf2_sha256$720000$pZ1Sss9GTFZTw1nk4RrG8I$50p7cgi7Q7FA8TapqrlBzqsyJfXs1ckbU0ssZJunCzw=", "username": "admin543", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-16 13:26:28.018905+07', NULL);
INSERT INTO public.audit_log VALUES (50, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'DELETE', 'users.useraccount', '5', '{"id": 5, "email": "newuser@example.com", "is_staff": true, "password": "pbkdf2_sha256$720000$VHYY7HqRbtd6o34CAE5AqO$SV2yjHjskz+EKeI1uDbZ1SiF0YGX/mZhd3kV7bd9SsI=", "username": "newuser", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', NULL, NULL, '2025-05-16 13:26:36.610174+07', NULL);
INSERT INTO public.audit_log VALUES (51, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'users.useraccount', '11', '{"id": 11, "email": "dsfdsfdsfdsf@mgial.com", "is_staff": true, "password": "pbkdf2_sha256$720000$jSLFz3ZuZ8vzqF13e98WwN$k0X2NTV4vL17dMfNYoTKrV5CeMmbYHy1GPd4m8sX3rU=", "username": "admingfffd", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 11, "email": "dsfdsfdsfdsf@mgial.com", "is_staff": true, "password": "pbkdf2_sha256$720000$jSLFz3ZuZ8vzqF13e98WwN$k0X2NTV4vL17dMfNYoTKrV5CeMmbYHy1GPd4m8sX3rU=", "username": "admingfffd", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-16 14:57:03.200781+07', NULL);
INSERT INTO public.audit_log VALUES (67, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'products.category', '2', '{"id": 2, "name": "Smart Watches", "slug": null, "parent": "Category object (1)", "is_active": null, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": "Modern smart watches with advanced features", "display_order": null, "meta_description": null}', '{"id": 2, "name": "Smart Watches", "slug": null, "parent": "Category object (1)", "is_active": null, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": "Modern smart watches with advanced features", "display_order": null, "meta_description": null}', NULL, '2025-05-16 16:40:27.584707+07', NULL);
INSERT INTO public.audit_log VALUES (52, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'users.useraccount', '6', '{"id": 6, "email": "6nLLUpT3DSt0@UIlKqMxukCwsXuQpcXUprOHL.dlg", "is_staff": true, "password": "pbkdf2_sha256$720000$4uLDUFqKHEpGpDue124s3o$hDKBwqogK8euae01gU3uLuX6GI0a+RtUbCHty5XMlu8=", "username": "do nisi est", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 6, "email": "6nLLUpT3DSt0@UIlKqMxukCwsXuQpcXUprOHL.dlg", "is_staff": true, "password": "pbkdf2_sha256$720000$4uLDUFqKHEpGpDue124s3o$hDKBwqogK8euae01gU3uLuX6GI0a+RtUbCHty5XMlu8=", "username": "do nisi est", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-16 15:05:59.65882+07', NULL);
INSERT INTO public.audit_log VALUES (53, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'users.useraccount', '7', '{"id": 7, "email": "newdguser@example.com", "is_staff": true, "password": "pbkdf2_sha256$720000$9P9s8J8afLcuTDzyatHD90$OIEPYP9RP04mYoiJMgfi9gy/PQebvVn44XXL+JcEx8M=", "username": "fsewuser", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 7, "email": "newdguser@example.com", "is_staff": true, "password": "pbkdf2_sha256$720000$9P9s8J8afLcuTDzyatHD90$OIEPYP9RP04mYoiJMgfi9gy/PQebvVn44XXL+JcEx8M=", "username": "fsewuser", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-16 15:07:13.573851+07', NULL);
INSERT INTO public.audit_log VALUES (57, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'users.useraccount', '4', '{"id": 4, "email": "dsad@gmail.com", "is_staff": true, "password": "pbkdf2_sha256$720000$pTMqPaNlCbiby49HcJ0SJC$hHlKALDyGMlEYnFrTmJswDTCstpfgdV04W8iy7bafDc=", "username": "viet", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 4, "email": "dsad@gmail.com", "is_staff": true, "password": "pbkdf2_sha256$720000$pTMqPaNlCbiby49HcJ0SJC$hHlKALDyGMlEYnFrTmJswDTCstpfgdV04W8iy7bafDc=", "username": "viet", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-16 15:18:31.623531+07', NULL);
INSERT INTO public.audit_log VALUES (58, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'users.useraccount', '1', '{"id": 1, "email": "admin@gmail.com", "is_staff": true, "password": "pbkdf2_sha256$720000$2waB0HgMB7JbvlO0jotP2t$aqfDssDIP13ySoeWds8JDSeSImANVziae11fnJbIuMo=", "username": "admin", "is_active": true, "last_login": "2025-05-14T09:29:21.863338+00:00", "is_superuser": true, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 1, "email": "admin@gmail.com", "is_staff": true, "password": "pbkdf2_sha256$720000$2waB0HgMB7JbvlO0jotP2t$aqfDssDIP13ySoeWds8JDSeSImANVziae11fnJbIuMo=", "username": "admin", "is_active": true, "last_login": "2025-05-14T09:29:21.863338+00:00", "is_superuser": true, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-16 15:59:45.22372+07', NULL);
INSERT INTO public.audit_log VALUES (59, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'users.useraccount', '4', '{"id": 4, "email": "dsad@gmail.com", "is_staff": true, "password": "pbkdf2_sha256$720000$pTMqPaNlCbiby49HcJ0SJC$hHlKALDyGMlEYnFrTmJswDTCstpfgdV04W8iy7bafDc=", "username": "viet", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 4, "email": "dsad@gmail.com", "is_staff": true, "password": "pbkdf2_sha256$720000$pTMqPaNlCbiby49HcJ0SJC$hHlKALDyGMlEYnFrTmJswDTCstpfgdV04W8iy7bafDc=", "username": "viet", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-16 16:09:40.275987+07', NULL);
INSERT INTO public.audit_log VALUES (60, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'users.useraccount', '4', '{"id": 4, "email": "dsad@gmail.com", "is_staff": true, "password": "pbkdf2_sha256$720000$pTMqPaNlCbiby49HcJ0SJC$hHlKALDyGMlEYnFrTmJswDTCstpfgdV04W8iy7bafDc=", "username": "viet", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 4, "email": "dsad@gmail.com", "is_staff": true, "password": "pbkdf2_sha256$720000$pTMqPaNlCbiby49HcJ0SJC$hHlKALDyGMlEYnFrTmJswDTCstpfgdV04W8iy7bafDc=", "username": "viet", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-16 16:15:49.75084+07', NULL);
INSERT INTO public.audit_log VALUES (61, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'users.useraccount', '4', '{"id": 4, "email": "dsad@gmail.com", "is_staff": true, "password": "pbkdf2_sha256$720000$pTMqPaNlCbiby49HcJ0SJC$hHlKALDyGMlEYnFrTmJswDTCstpfgdV04W8iy7bafDc=", "username": "viet", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', '{"id": 4, "email": "dsad@gmail.com", "is_staff": true, "password": "pbkdf2_sha256$720000$pTMqPaNlCbiby49HcJ0SJC$hHlKALDyGMlEYnFrTmJswDTCstpfgdV04W8iy7bafDc=", "username": "viet", "is_active": true, "last_login": null, "is_superuser": false, "account_locked_until": null, "failed_login_attempts": 0}', NULL, '2025-05-16 16:19:41.591676+07', NULL);
INSERT INTO public.audit_log VALUES (62, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'products.product', '4', '{"id": 4, "name": "Đồng hồ Casio", "slug": null, "brand": null, "category": null, "is_active": null, "base_price": 200000.0, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": null, "is_featured": null, "warranty_period": null, "meta_description": null}', '{"id": 4, "name": "Đồng hồ Casio", "slug": null, "brand": null, "category": null, "is_active": null, "base_price": 200000.0, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": null, "is_featured": null, "warranty_period": null, "meta_description": null}', NULL, '2025-05-16 16:37:02.991831+07', NULL);
INSERT INTO public.audit_log VALUES (63, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'products.product', '5', '{"id": 5, "name": "Đồng hồ Casio", "slug": null, "brand": null, "category": null, "is_active": null, "base_price": 200000.0, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": null, "is_featured": null, "warranty_period": null, "meta_description": null}', '{"id": 5, "name": "Đồng hồ Casio", "slug": null, "brand": null, "category": null, "is_active": null, "base_price": 200000.0, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": null, "is_featured": null, "warranty_period": null, "meta_description": null}', NULL, '2025-05-16 16:37:19.773676+07', NULL);
INSERT INTO public.audit_log VALUES (68, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'products.product', '7', '{"id": 7, "name": "Product Name", "slug": null, "brand": null, "category": null, "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": null}', '{"id": 7, "name": "Product Name", "slug": null, "brand": null, "category": null, "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": null}', NULL, '2025-05-16 16:49:25.654807+07', NULL);
INSERT INTO public.audit_log VALUES (69, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'products.product', '8', '{"id": 8, "name": "Product Name", "slug": null, "brand": null, "category": null, "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": null}', '{"id": 8, "name": "Product Name", "slug": null, "brand": null, "category": null, "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": null}', NULL, '2025-05-16 16:50:50.103651+07', NULL);
INSERT INTO public.audit_log VALUES (70, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'products.product', '9', '{"id": 9, "name": "Product Name", "slug": null, "brand": null, "category": null, "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": null}', '{"id": 9, "name": "Product Name", "slug": null, "brand": null, "category": null, "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": null}', NULL, '2025-05-16 16:51:11.19522+07', NULL);
INSERT INTO public.audit_log VALUES (71, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'products.product', '10', '{"id": 10, "name": "Product Name", "slug": null, "brand": null, "category": null, "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": null}', '{"id": 10, "name": "Product Name", "slug": null, "brand": null, "category": null, "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": null}', NULL, '2025-05-16 16:52:18.807022+07', NULL);
INSERT INTO public.audit_log VALUES (72, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'products.product', '10', '{"id": 10, "name": "Product Name", "slug": null, "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": null}', '{"id": 10, "name": "Product Name", "slug": null, "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": null}', NULL, '2025-05-16 16:52:18.827007+07', NULL);
INSERT INTO public.audit_log VALUES (73, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'products.product', '11', '{"id": 11, "name": "gdfdsf", "slug": "fđfgfdgfg", "brand": null, "category": null, "is_active": true, "base_price": 75465465.0, "created_by": null, "is_deleted": null, "meta_title": "", "updated_by": null, "description": "gfđsfdsf", "is_featured": false, "warranty_period": 43, "meta_description": ""}', '{"id": 11, "name": "gdfdsf", "slug": "fđfgfdgfg", "brand": null, "category": null, "is_active": true, "base_price": 75465465.0, "created_by": null, "is_deleted": null, "meta_title": "", "updated_by": null, "description": "gfđsfdsf", "is_featured": false, "warranty_period": 43, "meta_description": ""}', NULL, '2025-05-16 17:26:51.170958+07', NULL);
INSERT INTO public.audit_log VALUES (74, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'products.product', '11', '{"id": 11, "name": "gdfdsf", "slug": "fđfgfdgfg", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 75465465.0, "created_by": null, "is_deleted": null, "meta_title": "", "updated_by": null, "description": "gfđsfdsf", "is_featured": false, "warranty_period": 43, "meta_description": ""}', '{"id": 11, "name": "gdfdsf", "slug": "fđfgfdgfg", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 75465465.0, "created_by": null, "is_deleted": null, "meta_title": "", "updated_by": null, "description": "gfđsfdsf", "is_featured": false, "warranty_period": 43, "meta_description": ""}', NULL, '2025-05-16 17:26:51.188691+07', NULL);
INSERT INTO public.audit_log VALUES (76, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'DELETE', 'products.product', '2', '{"id": 2, "name": "Đồng hồ Casio", "slug": null, "brand": null, "category": null, "is_active": null, "base_price": 2000000.0, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": null, "is_featured": null, "warranty_period": null, "meta_description": null}', NULL, NULL, '2025-05-16 17:30:53.920615+07', NULL);
INSERT INTO public.audit_log VALUES (79, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'products.product', '3', '{"id": 3, "name": "Đồng hồ Casio", "slug": "", "brand": "Brand object (1)", "category": "Category object (2)", "is_active": null, "base_price": 200000.0, "created_by": null, "is_deleted": null, "meta_title": "", "updated_by": null, "description": "", "is_featured": false, "warranty_period": null, "meta_description": ""}', '{"id": 3, "name": "Đồng hồ Casio", "slug": "", "brand": "Brand object (1)", "category": "Category object (2)", "is_active": null, "base_price": 200000.0, "created_by": null, "is_deleted": null, "meta_title": "", "updated_by": null, "description": "", "is_featured": false, "warranty_period": null, "meta_description": ""}', NULL, '2025-05-16 17:35:48.748644+07', NULL);
INSERT INTO public.audit_log VALUES (80, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'products.product', '12', '{"id": 12, "name": "Tên sản phẩm", "slug": "ten-san-pham", "brand": null, "category": null, "is_active": true, "base_price": 1000000.0, "created_by": null, "is_deleted": null, "meta_title": "Meta title", "updated_by": null, "description": "Mô tả sản phẩm", "is_featured": true, "warranty_period": 12, "meta_description": "Meta description"}', '{"id": 12, "name": "Tên sản phẩm", "slug": "ten-san-pham", "brand": null, "category": null, "is_active": true, "base_price": 1000000.0, "created_by": null, "is_deleted": null, "meta_title": "Meta title", "updated_by": null, "description": "Mô tả sản phẩm", "is_featured": true, "warranty_period": 12, "meta_description": "Meta description"}', NULL, '2025-05-16 17:39:26.340108+07', NULL);
INSERT INTO public.audit_log VALUES (90, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'products.product', '5', '{"id": 5, "name": "Đồng hồ Casio", "slug": "4234", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": false, "base_price": 200000.0, "created_by": null, "is_deleted": null, "meta_title": "fdsfd", "updated_by": null, "description": "", "is_featured": false, "warranty_period": 12, "meta_description": "dsfdsf"}', '{"id": 5, "name": "Đồng hồ Casio", "slug": "4234", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": false, "base_price": 200000.0, "created_by": null, "is_deleted": null, "meta_title": "fdsfd", "updated_by": null, "description": "", "is_featured": false, "warranty_period": 12, "meta_description": "dsfdsf"}', NULL, '2025-05-16 18:53:23.703839+07', NULL);
INSERT INTO public.audit_log VALUES (81, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'products.product', '12', '{"id": 12, "name": "Tên sản phẩm", "slug": "ten-san-pham", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000000.0, "created_by": null, "is_deleted": null, "meta_title": "Meta title", "updated_by": null, "description": "Mô tả sản phẩm", "is_featured": true, "warranty_period": 12, "meta_description": "Meta description"}', '{"id": 12, "name": "Tên sản phẩm", "slug": "ten-san-pham", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000000.0, "created_by": null, "is_deleted": null, "meta_title": "Meta title", "updated_by": null, "description": "Mô tả sản phẩm", "is_featured": true, "warranty_period": 12, "meta_description": "Meta description"}', NULL, '2025-05-16 17:39:26.354176+07', NULL);
INSERT INTO public.audit_log VALUES (82, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'products.product', '13', '{"id": 13, "name": "Tên sản phẩm", "slug": "ten-san-ph", "brand": null, "category": null, "is_active": true, "base_price": 1000000.0, "created_by": null, "is_deleted": null, "meta_title": "Meta title", "updated_by": null, "description": "Mô tả sản phẩm", "is_featured": true, "warranty_period": 12, "meta_description": "Meta description"}', '{"id": 13, "name": "Tên sản phẩm", "slug": "ten-san-ph", "brand": null, "category": null, "is_active": true, "base_price": 1000000.0, "created_by": null, "is_deleted": null, "meta_title": "Meta title", "updated_by": null, "description": "Mô tả sản phẩm", "is_featured": true, "warranty_period": 12, "meta_description": "Meta description"}', NULL, '2025-05-16 17:40:11.910782+07', NULL);
INSERT INTO public.audit_log VALUES (83, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'products.product', '13', '{"id": 13, "name": "Tên sản phẩm", "slug": "ten-san-ph", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000000.0, "created_by": null, "is_deleted": null, "meta_title": "Meta title", "updated_by": null, "description": "Mô tả sản phẩm", "is_featured": true, "warranty_period": 12, "meta_description": "Meta description"}', '{"id": 13, "name": "Tên sản phẩm", "slug": "ten-san-ph", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000000.0, "created_by": null, "is_deleted": null, "meta_title": "Meta title", "updated_by": null, "description": "Mô tả sản phẩm", "is_featured": true, "warranty_period": 12, "meta_description": "Meta description"}', NULL, '2025-05-16 17:40:11.923787+07', NULL);
INSERT INTO public.audit_log VALUES (84, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'products.product', '14', '{"id": 14, "name": "Tên sản phẩm", "slug": "ten-san-", "brand": null, "category": null, "is_active": true, "base_price": 1000000.0, "created_by": null, "is_deleted": null, "meta_title": "Meta title", "updated_by": null, "description": "Mô tả sản phẩm", "is_featured": true, "warranty_period": 12, "meta_description": "Meta description"}', '{"id": 14, "name": "Tên sản phẩm", "slug": "ten-san-", "brand": null, "category": null, "is_active": true, "base_price": 1000000.0, "created_by": null, "is_deleted": null, "meta_title": "Meta title", "updated_by": null, "description": "Mô tả sản phẩm", "is_featured": true, "warranty_period": 12, "meta_description": "Meta description"}', NULL, '2025-05-16 17:46:45.948754+07', NULL);
INSERT INTO public.audit_log VALUES (85, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'products.product', '14', '{"id": 14, "name": "Tên sản phẩm", "slug": "ten-san-", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000000.0, "created_by": null, "is_deleted": null, "meta_title": "Meta title", "updated_by": null, "description": "Mô tả sản phẩm", "is_featured": true, "warranty_period": 12, "meta_description": "Meta description"}', '{"id": 14, "name": "Tên sản phẩm", "slug": "ten-san-", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000000.0, "created_by": null, "is_deleted": null, "meta_title": "Meta title", "updated_by": null, "description": "Mô tả sản phẩm", "is_featured": true, "warranty_period": 12, "meta_description": "Meta description"}', NULL, '2025-05-16 17:46:45.966542+07', NULL);
INSERT INTO public.audit_log VALUES (86, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'products.product', '16', '{"id": 16, "name": "Tên sản phẩm", "slug": "ten-sa", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000000.0, "created_by": null, "is_deleted": null, "meta_title": "Meta title", "updated_by": null, "description": "Mô tả sản phẩm", "is_featured": true, "warranty_period": 12, "meta_description": "Meta description"}', '{"id": 16, "name": "Tên sản phẩm", "slug": "ten-sa", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000000.0, "created_by": null, "is_deleted": null, "meta_title": "Meta title", "updated_by": null, "description": "Mô tả sản phẩm", "is_featured": true, "warranty_period": 12, "meta_description": "Meta description"}', NULL, '2025-05-16 18:03:11.815035+07', NULL);
INSERT INTO public.audit_log VALUES (87, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'products.product', '17', '{"id": 17, "name": "gfdgdfgfd", "slug": "gfhgfh", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 546545.0, "created_by": null, "is_deleted": null, "meta_title": "", "updated_by": null, "description": "gdfgfdg", "is_featured": false, "warranty_period": 45, "meta_description": ""}', '{"id": 17, "name": "gfdgdfgfd", "slug": "gfhgfh", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 546545.0, "created_by": null, "is_deleted": null, "meta_title": "", "updated_by": null, "description": "gdfgfdg", "is_featured": false, "warranty_period": 45, "meta_description": ""}', NULL, '2025-05-16 18:09:59.910088+07', NULL);
INSERT INTO public.audit_log VALUES (88, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'products.product', '3', '{"id": 3, "name": "Tên sản phẩm mới", "slug": "", "brand": "Brand object (1)", "category": "Category object (2)", "is_active": null, "base_price": 1000000.0, "created_by": null, "is_deleted": null, "meta_title": "", "updated_by": null, "description": "", "is_featured": false, "warranty_period": null, "meta_description": ""}', '{"id": 3, "name": "Tên sản phẩm mới", "slug": "", "brand": "Brand object (1)", "category": "Category object (2)", "is_active": null, "base_price": 1000000.0, "created_by": null, "is_deleted": null, "meta_title": "", "updated_by": null, "description": "", "is_featured": false, "warranty_period": null, "meta_description": ""}', NULL, '2025-05-16 18:12:46.263521+07', NULL);
INSERT INTO public.audit_log VALUES (89, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'products.product', '4', '{"id": 4, "name": "Đồng hồ Casio", "slug": "dsadsad", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": false, "base_price": 200000.0, "created_by": null, "is_deleted": null, "meta_title": "fdsf", "updated_by": null, "description": "", "is_featured": false, "warranty_period": 122, "meta_description": "fdsfdsf"}', '{"id": 4, "name": "Đồng hồ Casio", "slug": "dsadsad", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": false, "base_price": 200000.0, "created_by": null, "is_deleted": null, "meta_title": "fdsf", "updated_by": null, "description": "", "is_featured": false, "warranty_period": 122, "meta_description": "fdsfdsf"}', NULL, '2025-05-16 18:37:48.799648+07', NULL);
INSERT INTO public.audit_log VALUES (91, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'products.product', '6', '{"id": 6, "name": "Đồng hồ Casio", "slug": "32", "brand": "Brand object (1)", "category": "Category object (2)", "is_active": false, "base_price": 200000.0, "created_by": null, "is_deleted": null, "meta_title": "fdsfd", "updated_by": null, "description": "", "is_featured": false, "warranty_period": 12, "meta_description": "fdsf"}', '{"id": 6, "name": "Đồng hồ Casio", "slug": "32", "brand": "Brand object (1)", "category": "Category object (2)", "is_active": false, "base_price": 200000.0, "created_by": null, "is_deleted": null, "meta_title": "fdsfd", "updated_by": null, "description": "", "is_featured": false, "warranty_period": 12, "meta_description": "fdsf"}', NULL, '2025-05-16 18:55:51.845424+07', NULL);
INSERT INTO public.audit_log VALUES (92, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'products.product', '7', '{"id": 7, "name": "Product Name", "slug": "12", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": null, "meta_title": "sds", "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": "fsad"}', '{"id": 7, "name": "Product Name", "slug": "12", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": null, "meta_title": "sds", "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": "fsad"}', NULL, '2025-05-16 18:57:28.875124+07', NULL);
INSERT INTO public.audit_log VALUES (93, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'products.product', '8', '{"id": 8, "name": "Product Name", "slug": "ds", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": null, "meta_title": "", "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": ""}', '{"id": 8, "name": "Product Name", "slug": "ds", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": null, "meta_title": "", "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": ""}', NULL, '2025-05-16 18:59:05.499299+07', NULL);
INSERT INTO public.audit_log VALUES (94, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'products.product', '9', '{"id": 9, "name": "Product Name", "slug": "fg", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": null, "meta_title": "", "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": ""}', '{"id": 9, "name": "Product Name", "slug": "fg", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1000.0, "created_by": null, "is_deleted": null, "meta_title": "", "updated_by": null, "description": "Product Description", "is_featured": true, "warranty_period": 12, "meta_description": ""}', NULL, '2025-05-16 19:00:22.000375+07', NULL);
INSERT INTO public.audit_log VALUES (95, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'CREATE', 'products.product', '18', '{"id": 18, "name": "Dong ho cuc xin", "slug": "dgfdg", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1543543.0, "created_by": null, "is_deleted": null, "meta_title": "", "updated_by": null, "description": "", "is_featured": false, "warranty_period": 12, "meta_description": ""}', '{"id": 18, "name": "Dong ho cuc xin", "slug": "dgfdg", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1543543.0, "created_by": null, "is_deleted": null, "meta_title": "", "updated_by": null, "description": "", "is_featured": false, "warranty_period": 12, "meta_description": ""}', NULL, '2025-05-16 19:03:47.225242+07', NULL);
INSERT INTO public.audit_log VALUES (96, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'products.product', '3', '{"id": 3, "name": "Tên sản phẩm mới", "slug": "dfsdfgf", "brand": "Brand object (1)", "category": "Category object (2)", "is_active": true, "base_price": 1000000.0, "created_by": null, "is_deleted": null, "meta_title": "", "updated_by": null, "description": "", "is_featured": false, "warranty_period": 32, "meta_description": ""}', '{"id": 3, "name": "Tên sản phẩm mới", "slug": "dfsdfgf", "brand": "Brand object (1)", "category": "Category object (2)", "is_active": true, "base_price": 1000000.0, "created_by": null, "is_deleted": null, "meta_title": "", "updated_by": null, "description": "", "is_featured": false, "warranty_period": 32, "meta_description": ""}', NULL, '2025-05-16 19:04:12.24326+07', NULL);
INSERT INTO public.audit_log VALUES (97, false, '2025-05-17 16:14:21.818273+07', '2025-05-17 16:14:21.944931+07', 'UPDATE', 'products.category', '2', '{"id": 2, "name": "Cool Watches", "slug": null, "parent": "Category object (1)", "is_active": null, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": "Modern smart watches with advanced features", "display_order": null, "meta_description": null}', '{"id": 2, "name": "Cool Watches", "slug": null, "parent": "Category object (1)", "is_active": null, "created_by": null, "is_deleted": null, "meta_title": null, "updated_by": null, "description": "Modern smart watches with advanced features", "display_order": null, "meta_description": null}', NULL, '2025-05-16 19:05:06.457378+07', NULL);
INSERT INTO public.audit_log VALUES (122, false, '2025-05-17 19:55:21.1739+07', '2025-05-17 19:55:21.1739+07', 'UPDATE', 'products.product', '18', '{"id": 18, "name": "Dong ho cuc xin", "slug": "dgfdg", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1543543.0, "created_by": null, "is_deleted": false, "meta_title": "", "updated_by": null, "description": "", "is_featured": false, "warranty_period": 12, "meta_description": ""}', '{"id": 18, "name": "Dong ho cuc xin", "slug": "dgfdg", "brand": "Brand object (1)", "category": "Category object (1)", "is_active": true, "base_price": 1543543.0, "created_by": null, "is_deleted": false, "meta_title": "", "updated_by": null, "description": "", "is_featured": false, "warranty_period": 12, "meta_description": ""}', NULL, '2025-05-17 19:55:21.174919+07', NULL);


--
-- TOC entry 5374 (class 0 OID 29752)
-- Dependencies: 224
-- Data for Name: auth_group; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.auth_group VALUES (3, 'Nhân viên');
INSERT INTO public.auth_group VALUES (4, 'Nhân viên 2');
INSERT INTO public.auth_group VALUES (2, 'Quản lý');
INSERT INTO public.auth_group VALUES (5, 'Nhân viên 3');


--
-- TOC entry 5370 (class 0 OID 29738)
-- Dependencies: 220
-- Data for Name: django_content_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.django_content_type VALUES (1, 'admin', 'logentry');
INSERT INTO public.django_content_type VALUES (2, 'auth', 'permission');
INSERT INTO public.django_content_type VALUES (3, 'auth', 'group');
INSERT INTO public.django_content_type VALUES (4, 'contenttypes', 'contenttype');
INSERT INTO public.django_content_type VALUES (5, 'sessions', 'session');
INSERT INTO public.django_content_type VALUES (6, 'core', 'auditlog');
INSERT INTO public.django_content_type VALUES (7, 'users', 'useraccount');
INSERT INTO public.django_content_type VALUES (8, 'products', 'attributetype');
INSERT INTO public.django_content_type VALUES (9, 'products', 'brand');
INSERT INTO public.django_content_type VALUES (10, 'products', 'category');
INSERT INTO public.django_content_type VALUES (11, 'products', 'product');
INSERT INTO public.django_content_type VALUES (12, 'products', 'productimage');
INSERT INTO public.django_content_type VALUES (13, 'products', 'productvariant');
INSERT INTO public.django_content_type VALUES (14, 'products', 'productvariantattribute');
INSERT INTO public.django_content_type VALUES (15, 'products', 'attributevalue');
INSERT INTO public.django_content_type VALUES (16, 'orders', 'coupon');
INSERT INTO public.django_content_type VALUES (17, 'orders', 'customer');
INSERT INTO public.django_content_type VALUES (18, 'orders', 'orderdetail');
INSERT INTO public.django_content_type VALUES (19, 'orders', 'orders');
INSERT INTO public.django_content_type VALUES (20, 'orders', 'returnorder');
INSERT INTO public.django_content_type VALUES (21, 'orders', 'returnorderdetail');
INSERT INTO public.django_content_type VALUES (22, 'warranty', 'warranty');
INSERT INTO public.django_content_type VALUES (23, 'warranty', 'warrantyclaim');
INSERT INTO public.django_content_type VALUES (24, 'content', 'banner');
INSERT INTO public.django_content_type VALUES (25, 'content', 'contactinfo');
INSERT INTO public.django_content_type VALUES (26, 'content', 'footercategory');
INSERT INTO public.django_content_type VALUES (27, 'content', 'footerlink');
INSERT INTO public.django_content_type VALUES (28, 'content', 'news');
INSERT INTO public.django_content_type VALUES (29, 'content', 'newscategory');
INSERT INTO public.django_content_type VALUES (30, 'inventory', 'inventory');
INSERT INTO public.django_content_type VALUES (31, 'inventory', 'inventorytransaction');
INSERT INTO public.django_content_type VALUES (32, 'inventory', 'stocktake');
INSERT INTO public.django_content_type VALUES (33, 'inventory', 'stocktakedetail');
INSERT INTO public.django_content_type VALUES (34, 'inventory', 'stocktransfer');
INSERT INTO public.django_content_type VALUES (35, 'inventory', 'stocktransferdetail');
INSERT INTO public.django_content_type VALUES (36, 'stores', 'employee');
INSERT INTO public.django_content_type VALUES (37, 'stores', 'store');
INSERT INTO public.django_content_type VALUES (38, 'stores', 'supplier');
INSERT INTO public.django_content_type VALUES (39, 'reports', 'dailyrevenue');
INSERT INTO public.django_content_type VALUES (40, 'reports', 'topproduct');


--
-- TOC entry 5372 (class 0 OID 29746)
-- Dependencies: 222
-- Data for Name: auth_permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.auth_permission VALUES (1, 'Can add log entry', 1, 'add_logentry');
INSERT INTO public.auth_permission VALUES (2, 'Can change log entry', 1, 'change_logentry');
INSERT INTO public.auth_permission VALUES (3, 'Can delete log entry', 1, 'delete_logentry');
INSERT INTO public.auth_permission VALUES (4, 'Can view log entry', 1, 'view_logentry');
INSERT INTO public.auth_permission VALUES (5, 'Can add permission', 2, 'add_permission');
INSERT INTO public.auth_permission VALUES (6, 'Can change permission', 2, 'change_permission');
INSERT INTO public.auth_permission VALUES (7, 'Can delete permission', 2, 'delete_permission');
INSERT INTO public.auth_permission VALUES (8, 'Can view permission', 2, 'view_permission');
INSERT INTO public.auth_permission VALUES (9, 'Can add group', 3, 'add_group');
INSERT INTO public.auth_permission VALUES (10, 'Can change group', 3, 'change_group');
INSERT INTO public.auth_permission VALUES (11, 'Can delete group', 3, 'delete_group');
INSERT INTO public.auth_permission VALUES (12, 'Can view group', 3, 'view_group');
INSERT INTO public.auth_permission VALUES (13, 'Can add content type', 4, 'add_contenttype');
INSERT INTO public.auth_permission VALUES (14, 'Can change content type', 4, 'change_contenttype');
INSERT INTO public.auth_permission VALUES (15, 'Can delete content type', 4, 'delete_contenttype');
INSERT INTO public.auth_permission VALUES (16, 'Can view content type', 4, 'view_contenttype');
INSERT INTO public.auth_permission VALUES (17, 'Can add session', 5, 'add_session');
INSERT INTO public.auth_permission VALUES (18, 'Can change session', 5, 'change_session');
INSERT INTO public.auth_permission VALUES (19, 'Can delete session', 5, 'delete_session');
INSERT INTO public.auth_permission VALUES (20, 'Can view session', 5, 'view_session');
INSERT INTO public.auth_permission VALUES (21, 'Can add audit log', 6, 'add_auditlog');
INSERT INTO public.auth_permission VALUES (22, 'Can change audit log', 6, 'change_auditlog');
INSERT INTO public.auth_permission VALUES (23, 'Can delete audit log', 6, 'delete_auditlog');
INSERT INTO public.auth_permission VALUES (24, 'Can view audit log', 6, 'view_auditlog');
INSERT INTO public.auth_permission VALUES (25, 'Can add user account', 7, 'add_useraccount');
INSERT INTO public.auth_permission VALUES (26, 'Can change user account', 7, 'change_useraccount');
INSERT INTO public.auth_permission VALUES (27, 'Can delete user account', 7, 'delete_useraccount');
INSERT INTO public.auth_permission VALUES (28, 'Can view user account', 7, 'view_useraccount');
INSERT INTO public.auth_permission VALUES (29, 'Can add attribute type', 8, 'add_attributetype');
INSERT INTO public.auth_permission VALUES (30, 'Can change attribute type', 8, 'change_attributetype');
INSERT INTO public.auth_permission VALUES (31, 'Can delete attribute type', 8, 'delete_attributetype');
INSERT INTO public.auth_permission VALUES (32, 'Can view attribute type', 8, 'view_attributetype');
INSERT INTO public.auth_permission VALUES (33, 'Can add brand', 9, 'add_brand');
INSERT INTO public.auth_permission VALUES (34, 'Can change brand', 9, 'change_brand');
INSERT INTO public.auth_permission VALUES (35, 'Can delete brand', 9, 'delete_brand');
INSERT INTO public.auth_permission VALUES (36, 'Can view brand', 9, 'view_brand');
INSERT INTO public.auth_permission VALUES (37, 'Can add category', 10, 'add_category');
INSERT INTO public.auth_permission VALUES (38, 'Can change category', 10, 'change_category');
INSERT INTO public.auth_permission VALUES (39, 'Can delete category', 10, 'delete_category');
INSERT INTO public.auth_permission VALUES (40, 'Can view category', 10, 'view_category');
INSERT INTO public.auth_permission VALUES (41, 'Can add product', 11, 'add_product');
INSERT INTO public.auth_permission VALUES (42, 'Can change product', 11, 'change_product');
INSERT INTO public.auth_permission VALUES (43, 'Can delete product', 11, 'delete_product');
INSERT INTO public.auth_permission VALUES (44, 'Can view product', 11, 'view_product');
INSERT INTO public.auth_permission VALUES (45, 'Can add product image', 12, 'add_productimage');
INSERT INTO public.auth_permission VALUES (46, 'Can change product image', 12, 'change_productimage');
INSERT INTO public.auth_permission VALUES (47, 'Can delete product image', 12, 'delete_productimage');
INSERT INTO public.auth_permission VALUES (48, 'Can view product image', 12, 'view_productimage');
INSERT INTO public.auth_permission VALUES (49, 'Can add product variant', 13, 'add_productvariant');
INSERT INTO public.auth_permission VALUES (50, 'Can change product variant', 13, 'change_productvariant');
INSERT INTO public.auth_permission VALUES (51, 'Can delete product variant', 13, 'delete_productvariant');
INSERT INTO public.auth_permission VALUES (52, 'Can view product variant', 13, 'view_productvariant');
INSERT INTO public.auth_permission VALUES (53, 'Can add product variant attribute', 14, 'add_productvariantattribute');
INSERT INTO public.auth_permission VALUES (54, 'Can change product variant attribute', 14, 'change_productvariantattribute');
INSERT INTO public.auth_permission VALUES (55, 'Can delete product variant attribute', 14, 'delete_productvariantattribute');
INSERT INTO public.auth_permission VALUES (56, 'Can view product variant attribute', 14, 'view_productvariantattribute');
INSERT INTO public.auth_permission VALUES (57, 'Can add attribute value', 15, 'add_attributevalue');
INSERT INTO public.auth_permission VALUES (58, 'Can change attribute value', 15, 'change_attributevalue');
INSERT INTO public.auth_permission VALUES (59, 'Can delete attribute value', 15, 'delete_attributevalue');
INSERT INTO public.auth_permission VALUES (60, 'Can view attribute value', 15, 'view_attributevalue');
INSERT INTO public.auth_permission VALUES (61, 'Can add coupon', 16, 'add_coupon');
INSERT INTO public.auth_permission VALUES (62, 'Can change coupon', 16, 'change_coupon');
INSERT INTO public.auth_permission VALUES (63, 'Can delete coupon', 16, 'delete_coupon');
INSERT INTO public.auth_permission VALUES (64, 'Can view coupon', 16, 'view_coupon');
INSERT INTO public.auth_permission VALUES (65, 'Can add customer', 17, 'add_customer');
INSERT INTO public.auth_permission VALUES (66, 'Can change customer', 17, 'change_customer');
INSERT INTO public.auth_permission VALUES (67, 'Can delete customer', 17, 'delete_customer');
INSERT INTO public.auth_permission VALUES (68, 'Can view customer', 17, 'view_customer');
INSERT INTO public.auth_permission VALUES (69, 'Can add order detail', 18, 'add_orderdetail');
INSERT INTO public.auth_permission VALUES (70, 'Can change order detail', 18, 'change_orderdetail');
INSERT INTO public.auth_permission VALUES (71, 'Can delete order detail', 18, 'delete_orderdetail');
INSERT INTO public.auth_permission VALUES (72, 'Can view order detail', 18, 'view_orderdetail');
INSERT INTO public.auth_permission VALUES (73, 'Can add orders', 19, 'add_orders');
INSERT INTO public.auth_permission VALUES (74, 'Can change orders', 19, 'change_orders');
INSERT INTO public.auth_permission VALUES (75, 'Can delete orders', 19, 'delete_orders');
INSERT INTO public.auth_permission VALUES (76, 'Can view orders', 19, 'view_orders');
INSERT INTO public.auth_permission VALUES (77, 'Can add return order', 20, 'add_returnorder');
INSERT INTO public.auth_permission VALUES (78, 'Can change return order', 20, 'change_returnorder');
INSERT INTO public.auth_permission VALUES (79, 'Can delete return order', 20, 'delete_returnorder');
INSERT INTO public.auth_permission VALUES (80, 'Can view return order', 20, 'view_returnorder');
INSERT INTO public.auth_permission VALUES (81, 'Can add return order detail', 21, 'add_returnorderdetail');
INSERT INTO public.auth_permission VALUES (82, 'Can change return order detail', 21, 'change_returnorderdetail');
INSERT INTO public.auth_permission VALUES (83, 'Can delete return order detail', 21, 'delete_returnorderdetail');
INSERT INTO public.auth_permission VALUES (84, 'Can view return order detail', 21, 'view_returnorderdetail');
INSERT INTO public.auth_permission VALUES (85, 'Can add warranty', 22, 'add_warranty');
INSERT INTO public.auth_permission VALUES (86, 'Can change warranty', 22, 'change_warranty');
INSERT INTO public.auth_permission VALUES (87, 'Can delete warranty', 22, 'delete_warranty');
INSERT INTO public.auth_permission VALUES (88, 'Can view warranty', 22, 'view_warranty');
INSERT INTO public.auth_permission VALUES (89, 'Can add warranty claim', 23, 'add_warrantyclaim');
INSERT INTO public.auth_permission VALUES (90, 'Can change warranty claim', 23, 'change_warrantyclaim');
INSERT INTO public.auth_permission VALUES (91, 'Can delete warranty claim', 23, 'delete_warrantyclaim');
INSERT INTO public.auth_permission VALUES (92, 'Can view warranty claim', 23, 'view_warrantyclaim');
INSERT INTO public.auth_permission VALUES (93, 'Can add banner', 24, 'add_banner');
INSERT INTO public.auth_permission VALUES (94, 'Can change banner', 24, 'change_banner');
INSERT INTO public.auth_permission VALUES (95, 'Can delete banner', 24, 'delete_banner');
INSERT INTO public.auth_permission VALUES (96, 'Can view banner', 24, 'view_banner');
INSERT INTO public.auth_permission VALUES (97, 'Can add contact info', 25, 'add_contactinfo');
INSERT INTO public.auth_permission VALUES (98, 'Can change contact info', 25, 'change_contactinfo');
INSERT INTO public.auth_permission VALUES (99, 'Can delete contact info', 25, 'delete_contactinfo');
INSERT INTO public.auth_permission VALUES (100, 'Can view contact info', 25, 'view_contactinfo');
INSERT INTO public.auth_permission VALUES (101, 'Can add footer category', 26, 'add_footercategory');
INSERT INTO public.auth_permission VALUES (102, 'Can change footer category', 26, 'change_footercategory');
INSERT INTO public.auth_permission VALUES (103, 'Can delete footer category', 26, 'delete_footercategory');
INSERT INTO public.auth_permission VALUES (104, 'Can view footer category', 26, 'view_footercategory');
INSERT INTO public.auth_permission VALUES (105, 'Can add footer link', 27, 'add_footerlink');
INSERT INTO public.auth_permission VALUES (106, 'Can change footer link', 27, 'change_footerlink');
INSERT INTO public.auth_permission VALUES (107, 'Can delete footer link', 27, 'delete_footerlink');
INSERT INTO public.auth_permission VALUES (108, 'Can view footer link', 27, 'view_footerlink');
INSERT INTO public.auth_permission VALUES (109, 'Can add news', 28, 'add_news');
INSERT INTO public.auth_permission VALUES (110, 'Can change news', 28, 'change_news');
INSERT INTO public.auth_permission VALUES (111, 'Can delete news', 28, 'delete_news');
INSERT INTO public.auth_permission VALUES (112, 'Can view news', 28, 'view_news');
INSERT INTO public.auth_permission VALUES (113, 'Can add news category', 29, 'add_newscategory');
INSERT INTO public.auth_permission VALUES (114, 'Can change news category', 29, 'change_newscategory');
INSERT INTO public.auth_permission VALUES (115, 'Can delete news category', 29, 'delete_newscategory');
INSERT INTO public.auth_permission VALUES (116, 'Can view news category', 29, 'view_newscategory');
INSERT INTO public.auth_permission VALUES (117, 'Can add inventory', 30, 'add_inventory');
INSERT INTO public.auth_permission VALUES (118, 'Can change inventory', 30, 'change_inventory');
INSERT INTO public.auth_permission VALUES (119, 'Can delete inventory', 30, 'delete_inventory');
INSERT INTO public.auth_permission VALUES (120, 'Can view inventory', 30, 'view_inventory');
INSERT INTO public.auth_permission VALUES (121, 'Can add inventory transaction', 31, 'add_inventorytransaction');
INSERT INTO public.auth_permission VALUES (122, 'Can change inventory transaction', 31, 'change_inventorytransaction');
INSERT INTO public.auth_permission VALUES (123, 'Can delete inventory transaction', 31, 'delete_inventorytransaction');
INSERT INTO public.auth_permission VALUES (124, 'Can view inventory transaction', 31, 'view_inventorytransaction');
INSERT INTO public.auth_permission VALUES (125, 'Can add stock take', 32, 'add_stocktake');
INSERT INTO public.auth_permission VALUES (126, 'Can change stock take', 32, 'change_stocktake');
INSERT INTO public.auth_permission VALUES (127, 'Can delete stock take', 32, 'delete_stocktake');
INSERT INTO public.auth_permission VALUES (128, 'Can view stock take', 32, 'view_stocktake');
INSERT INTO public.auth_permission VALUES (129, 'Can add stock take detail', 33, 'add_stocktakedetail');
INSERT INTO public.auth_permission VALUES (130, 'Can change stock take detail', 33, 'change_stocktakedetail');
INSERT INTO public.auth_permission VALUES (131, 'Can delete stock take detail', 33, 'delete_stocktakedetail');
INSERT INTO public.auth_permission VALUES (132, 'Can view stock take detail', 33, 'view_stocktakedetail');
INSERT INTO public.auth_permission VALUES (133, 'Can add stock transfer', 34, 'add_stocktransfer');
INSERT INTO public.auth_permission VALUES (134, 'Can change stock transfer', 34, 'change_stocktransfer');
INSERT INTO public.auth_permission VALUES (135, 'Can delete stock transfer', 34, 'delete_stocktransfer');
INSERT INTO public.auth_permission VALUES (136, 'Can view stock transfer', 34, 'view_stocktransfer');
INSERT INTO public.auth_permission VALUES (137, 'Can add stock transfer detail', 35, 'add_stocktransferdetail');
INSERT INTO public.auth_permission VALUES (138, 'Can change stock transfer detail', 35, 'change_stocktransferdetail');
INSERT INTO public.auth_permission VALUES (139, 'Can delete stock transfer detail', 35, 'delete_stocktransferdetail');
INSERT INTO public.auth_permission VALUES (140, 'Can view stock transfer detail', 35, 'view_stocktransferdetail');
INSERT INTO public.auth_permission VALUES (141, 'Can add employee', 36, 'add_employee');
INSERT INTO public.auth_permission VALUES (142, 'Can change employee', 36, 'change_employee');
INSERT INTO public.auth_permission VALUES (143, 'Can delete employee', 36, 'delete_employee');
INSERT INTO public.auth_permission VALUES (144, 'Can view employee', 36, 'view_employee');
INSERT INTO public.auth_permission VALUES (145, 'Can add store', 37, 'add_store');
INSERT INTO public.auth_permission VALUES (146, 'Can change store', 37, 'change_store');
INSERT INTO public.auth_permission VALUES (147, 'Can delete store', 37, 'delete_store');
INSERT INTO public.auth_permission VALUES (148, 'Can view store', 37, 'view_store');
INSERT INTO public.auth_permission VALUES (149, 'Can add supplier', 38, 'add_supplier');
INSERT INTO public.auth_permission VALUES (150, 'Can change supplier', 38, 'change_supplier');
INSERT INTO public.auth_permission VALUES (151, 'Can delete supplier', 38, 'delete_supplier');
INSERT INTO public.auth_permission VALUES (152, 'Can view supplier', 38, 'view_supplier');
INSERT INTO public.auth_permission VALUES (153, 'Can add daily revenue', 39, 'add_dailyrevenue');
INSERT INTO public.auth_permission VALUES (154, 'Can change daily revenue', 39, 'change_dailyrevenue');
INSERT INTO public.auth_permission VALUES (155, 'Can delete daily revenue', 39, 'delete_dailyrevenue');
INSERT INTO public.auth_permission VALUES (156, 'Can view daily revenue', 39, 'view_dailyrevenue');
INSERT INTO public.auth_permission VALUES (157, 'Can add top product', 40, 'add_topproduct');
INSERT INTO public.auth_permission VALUES (158, 'Can change top product', 40, 'change_topproduct');
INSERT INTO public.auth_permission VALUES (159, 'Can delete top product', 40, 'delete_topproduct');
INSERT INTO public.auth_permission VALUES (160, 'Can view top product', 40, 'view_topproduct');


--
-- TOC entry 5376 (class 0 OID 29760)
-- Dependencies: 226
-- Data for Name: auth_group_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.auth_group_permissions VALUES (5, 2, 17);
INSERT INTO public.auth_group_permissions VALUES (6, 2, 18);
INSERT INTO public.auth_group_permissions VALUES (7, 2, 19);
INSERT INTO public.auth_group_permissions VALUES (8, 2, 20);
INSERT INTO public.auth_group_permissions VALUES (9, 2, 29);
INSERT INTO public.auth_group_permissions VALUES (10, 2, 30);
INSERT INTO public.auth_group_permissions VALUES (11, 2, 31);
INSERT INTO public.auth_group_permissions VALUES (12, 2, 32);
INSERT INTO public.auth_group_permissions VALUES (13, 2, 33);
INSERT INTO public.auth_group_permissions VALUES (14, 2, 34);
INSERT INTO public.auth_group_permissions VALUES (15, 2, 35);
INSERT INTO public.auth_group_permissions VALUES (16, 2, 36);
INSERT INTO public.auth_group_permissions VALUES (17, 2, 37);
INSERT INTO public.auth_group_permissions VALUES (18, 2, 38);
INSERT INTO public.auth_group_permissions VALUES (19, 2, 39);
INSERT INTO public.auth_group_permissions VALUES (20, 2, 40);
INSERT INTO public.auth_group_permissions VALUES (21, 2, 41);
INSERT INTO public.auth_group_permissions VALUES (22, 2, 42);
INSERT INTO public.auth_group_permissions VALUES (23, 2, 43);
INSERT INTO public.auth_group_permissions VALUES (24, 2, 44);
INSERT INTO public.auth_group_permissions VALUES (25, 2, 45);
INSERT INTO public.auth_group_permissions VALUES (26, 2, 46);
INSERT INTO public.auth_group_permissions VALUES (27, 2, 47);
INSERT INTO public.auth_group_permissions VALUES (28, 2, 48);
INSERT INTO public.auth_group_permissions VALUES (29, 2, 49);
INSERT INTO public.auth_group_permissions VALUES (30, 2, 50);
INSERT INTO public.auth_group_permissions VALUES (31, 2, 51);
INSERT INTO public.auth_group_permissions VALUES (32, 2, 52);
INSERT INTO public.auth_group_permissions VALUES (33, 2, 53);
INSERT INTO public.auth_group_permissions VALUES (34, 2, 54);
INSERT INTO public.auth_group_permissions VALUES (35, 2, 55);
INSERT INTO public.auth_group_permissions VALUES (36, 2, 56);
INSERT INTO public.auth_group_permissions VALUES (37, 2, 57);
INSERT INTO public.auth_group_permissions VALUES (38, 2, 58);
INSERT INTO public.auth_group_permissions VALUES (39, 2, 59);
INSERT INTO public.auth_group_permissions VALUES (40, 2, 60);
INSERT INTO public.auth_group_permissions VALUES (41, 2, 61);
INSERT INTO public.auth_group_permissions VALUES (42, 2, 62);
INSERT INTO public.auth_group_permissions VALUES (43, 2, 63);
INSERT INTO public.auth_group_permissions VALUES (44, 2, 64);
INSERT INTO public.auth_group_permissions VALUES (45, 2, 65);
INSERT INTO public.auth_group_permissions VALUES (46, 2, 66);
INSERT INTO public.auth_group_permissions VALUES (47, 2, 67);
INSERT INTO public.auth_group_permissions VALUES (48, 2, 68);
INSERT INTO public.auth_group_permissions VALUES (49, 2, 69);
INSERT INTO public.auth_group_permissions VALUES (50, 2, 70);
INSERT INTO public.auth_group_permissions VALUES (51, 2, 71);
INSERT INTO public.auth_group_permissions VALUES (52, 2, 72);
INSERT INTO public.auth_group_permissions VALUES (53, 2, 73);
INSERT INTO public.auth_group_permissions VALUES (54, 2, 74);
INSERT INTO public.auth_group_permissions VALUES (55, 2, 75);
INSERT INTO public.auth_group_permissions VALUES (56, 2, 76);
INSERT INTO public.auth_group_permissions VALUES (57, 2, 77);
INSERT INTO public.auth_group_permissions VALUES (58, 2, 78);
INSERT INTO public.auth_group_permissions VALUES (59, 2, 79);
INSERT INTO public.auth_group_permissions VALUES (60, 2, 80);
INSERT INTO public.auth_group_permissions VALUES (61, 2, 81);
INSERT INTO public.auth_group_permissions VALUES (62, 2, 82);
INSERT INTO public.auth_group_permissions VALUES (63, 2, 83);
INSERT INTO public.auth_group_permissions VALUES (64, 2, 84);
INSERT INTO public.auth_group_permissions VALUES (65, 2, 117);
INSERT INTO public.auth_group_permissions VALUES (66, 2, 118);
INSERT INTO public.auth_group_permissions VALUES (67, 2, 119);
INSERT INTO public.auth_group_permissions VALUES (68, 2, 120);
INSERT INTO public.auth_group_permissions VALUES (69, 2, 121);
INSERT INTO public.auth_group_permissions VALUES (70, 2, 122);
INSERT INTO public.auth_group_permissions VALUES (71, 2, 123);
INSERT INTO public.auth_group_permissions VALUES (72, 2, 124);
INSERT INTO public.auth_group_permissions VALUES (73, 2, 125);
INSERT INTO public.auth_group_permissions VALUES (74, 2, 126);
INSERT INTO public.auth_group_permissions VALUES (75, 2, 127);
INSERT INTO public.auth_group_permissions VALUES (76, 2, 128);
INSERT INTO public.auth_group_permissions VALUES (77, 2, 129);
INSERT INTO public.auth_group_permissions VALUES (78, 2, 130);
INSERT INTO public.auth_group_permissions VALUES (79, 2, 131);
INSERT INTO public.auth_group_permissions VALUES (80, 2, 132);
INSERT INTO public.auth_group_permissions VALUES (81, 2, 133);
INSERT INTO public.auth_group_permissions VALUES (82, 2, 134);
INSERT INTO public.auth_group_permissions VALUES (83, 2, 135);
INSERT INTO public.auth_group_permissions VALUES (84, 2, 136);
INSERT INTO public.auth_group_permissions VALUES (85, 2, 137);
INSERT INTO public.auth_group_permissions VALUES (86, 2, 138);
INSERT INTO public.auth_group_permissions VALUES (87, 2, 139);
INSERT INTO public.auth_group_permissions VALUES (88, 2, 140);
INSERT INTO public.auth_group_permissions VALUES (89, 2, 141);
INSERT INTO public.auth_group_permissions VALUES (90, 2, 142);
INSERT INTO public.auth_group_permissions VALUES (91, 2, 143);
INSERT INTO public.auth_group_permissions VALUES (92, 2, 144);
INSERT INTO public.auth_group_permissions VALUES (93, 2, 145);
INSERT INTO public.auth_group_permissions VALUES (94, 2, 146);
INSERT INTO public.auth_group_permissions VALUES (95, 2, 147);
INSERT INTO public.auth_group_permissions VALUES (96, 2, 148);
INSERT INTO public.auth_group_permissions VALUES (97, 2, 149);
INSERT INTO public.auth_group_permissions VALUES (98, 2, 150);
INSERT INTO public.auth_group_permissions VALUES (99, 2, 151);
INSERT INTO public.auth_group_permissions VALUES (100, 2, 152);
INSERT INTO public.auth_group_permissions VALUES (101, 3, 41);
INSERT INTO public.auth_group_permissions VALUES (102, 3, 42);
INSERT INTO public.auth_group_permissions VALUES (103, 3, 43);
INSERT INTO public.auth_group_permissions VALUES (104, 3, 44);
INSERT INTO public.auth_group_permissions VALUES (105, 4, 41);
INSERT INTO public.auth_group_permissions VALUES (106, 4, 42);
INSERT INTO public.auth_group_permissions VALUES (107, 4, 43);
INSERT INTO public.auth_group_permissions VALUES (108, 4, 44);
INSERT INTO public.auth_group_permissions VALUES (109, 5, 128);
INSERT INTO public.auth_group_permissions VALUES (110, 5, 4);
INSERT INTO public.auth_group_permissions VALUES (111, 5, 132);
INSERT INTO public.auth_group_permissions VALUES (112, 5, 8);
INSERT INTO public.auth_group_permissions VALUES (113, 5, 136);
INSERT INTO public.auth_group_permissions VALUES (114, 5, 12);
INSERT INTO public.auth_group_permissions VALUES (115, 5, 140);
INSERT INTO public.auth_group_permissions VALUES (116, 5, 16);
INSERT INTO public.auth_group_permissions VALUES (117, 5, 144);
INSERT INTO public.auth_group_permissions VALUES (118, 5, 20);
INSERT INTO public.auth_group_permissions VALUES (119, 5, 148);
INSERT INTO public.auth_group_permissions VALUES (120, 5, 24);
INSERT INTO public.auth_group_permissions VALUES (121, 5, 152);
INSERT INTO public.auth_group_permissions VALUES (122, 5, 28);
INSERT INTO public.auth_group_permissions VALUES (123, 5, 156);
INSERT INTO public.auth_group_permissions VALUES (124, 5, 32);
INSERT INTO public.auth_group_permissions VALUES (125, 5, 160);
INSERT INTO public.auth_group_permissions VALUES (126, 5, 36);
INSERT INTO public.auth_group_permissions VALUES (127, 5, 40);
INSERT INTO public.auth_group_permissions VALUES (128, 5, 44);
INSERT INTO public.auth_group_permissions VALUES (129, 5, 48);
INSERT INTO public.auth_group_permissions VALUES (130, 5, 52);
INSERT INTO public.auth_group_permissions VALUES (131, 5, 56);
INSERT INTO public.auth_group_permissions VALUES (132, 5, 60);
INSERT INTO public.auth_group_permissions VALUES (133, 5, 64);
INSERT INTO public.auth_group_permissions VALUES (134, 5, 68);
INSERT INTO public.auth_group_permissions VALUES (135, 5, 72);
INSERT INTO public.auth_group_permissions VALUES (136, 5, 76);
INSERT INTO public.auth_group_permissions VALUES (137, 5, 80);
INSERT INTO public.auth_group_permissions VALUES (138, 5, 84);
INSERT INTO public.auth_group_permissions VALUES (139, 5, 88);
INSERT INTO public.auth_group_permissions VALUES (140, 5, 92);
INSERT INTO public.auth_group_permissions VALUES (141, 5, 96);
INSERT INTO public.auth_group_permissions VALUES (142, 5, 100);
INSERT INTO public.auth_group_permissions VALUES (143, 5, 104);
INSERT INTO public.auth_group_permissions VALUES (144, 5, 108);
INSERT INTO public.auth_group_permissions VALUES (145, 5, 112);
INSERT INTO public.auth_group_permissions VALUES (146, 5, 116);
INSERT INTO public.auth_group_permissions VALUES (147, 5, 120);
INSERT INTO public.auth_group_permissions VALUES (148, 5, 124);


--
-- TOC entry 5386 (class 0 OID 29865)
-- Dependencies: 236
-- Data for Name: banner; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.banner VALUES (1, false, '2025-05-17 16:14:20.720335+07', '2025-05-17 16:17:59.533407+07', 'Banner khuyến mãi hè', '', '', NULL, NULL, 2, true, 'pages', NULL, NULL, 'banner/banner-khuyen-mai-he_YeM7ys1.png');
INSERT INTO public.banner VALUES (2, false, '2025-05-17 16:14:20.720335+07', '2025-05-17 16:18:48.349152+07', 'Banner khuyến mãi hè', '', '', NULL, NULL, 3, true, 'pages', NULL, NULL, 'banner/banner-khuyen-mai-he_peMHiDm.png');
INSERT INTO public.banner VALUES (3, false, '2025-05-17 16:15:12.695511+07', '2025-05-17 21:38:22.025959+07', 'Đồng hồ Patek Philip', '', 'Mẫu Patek Philip đắt nhất thế giới', NULL, NULL, 1, true, 'homepage', NULL, NULL, 'banner/ong-ho-patek-philip.png');


--
-- TOC entry 5408 (class 0 OID 30053)
-- Dependencies: 258
-- Data for Name: brand; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.brand VALUES (1, false, '2025-05-17 16:14:23.801052+07', '2025-05-17 16:14:23.907119+07', 'Citizen', 'Citizen is a Japanese watch manufacturer.', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.brand VALUES (2, false, '2025-05-17 18:25:19.315855+07', '2025-05-17 18:25:19.315855+07', 'Rolox', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.brand VALUES (3, false, '2025-05-17 20:10:09.996445+07', '2025-05-17 20:10:09.996445+07', 'Casio', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.brand VALUES (4, false, '2025-05-17 20:10:19.550268+07', '2025-05-17 20:10:19.550268+07', 'Patek Philip', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL);


--
-- TOC entry 5410 (class 0 OID 30063)
-- Dependencies: 260
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.category VALUES (1, false, '2025-05-17 16:14:23.958104+07', '2025-05-17 16:14:24.175919+07', 'Smart Watches', 'Modern smart watches with advanced features', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.category VALUES (2, false, '2025-05-17 16:14:23.958104+07', '2025-05-17 18:31:37.262705+07', 'Cool Watches', 'Modern smart watches with advanced features', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.category VALUES (3, false, '2025-05-17 18:32:09.247305+07', '2025-05-17 18:32:09.247305+07', 'Đồng hồ hơi thông minh', '', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL);
INSERT INTO public.category VALUES (4, false, '2025-05-17 18:32:21.110087+07', '2025-05-17 18:32:21.110087+07', 'Đồng hồ gái', '', NULL, NULL, NULL, NULL, NULL, NULL, 2, NULL);
INSERT INTO public.category VALUES (5, false, '2025-05-17 18:32:28.308722+07', '2025-05-17 18:32:28.308722+07', 'Đồng hồ trai', '', NULL, NULL, NULL, NULL, NULL, NULL, 2, NULL);
INSERT INTO public.category VALUES (6, false, '2025-05-17 18:32:38.2356+07', '2025-05-17 18:32:38.2356+07', 'Đồng hồ thể dục', '', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL);
INSERT INTO public.category VALUES (7, false, '2025-05-17 20:33:51.059576+07', '2025-05-17 20:33:51.060595+07', 'Nam', 'Nam', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.category VALUES (8, false, '2025-05-17 20:33:56.591499+07', '2025-05-17 20:33:56.591499+07', 'Nữ', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.category VALUES (9, false, '2025-05-17 20:34:20.661114+07', '2025-05-17 20:34:20.661114+07', 'Đồng hồ cho bé trai', '', NULL, NULL, NULL, NULL, NULL, NULL, 7, NULL);
INSERT INTO public.category VALUES (10, false, '2025-05-17 20:34:31.658639+07', '2025-05-17 20:34:31.658639+07', 'Đồng hồ cho bé gái', '', NULL, NULL, NULL, NULL, NULL, NULL, 8, NULL);


--
-- TOC entry 5388 (class 0 OID 29873)
-- Dependencies: 238
-- Data for Name: contactinfo; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5434 (class 0 OID 30263)
-- Dependencies: 284
-- Data for Name: coupon; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5384 (class 0 OID 29844)
-- Dependencies: 234
-- Data for Name: django_admin_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.django_admin_log VALUES (1, '2025-05-14 14:52:08.533624+07', '1', 'Nhân viên', 1, '[{"added": {}}]', 3, 1);
INSERT INTO public.django_admin_log VALUES (2, '2025-05-14 14:52:46.242608+07', '2', 'Quản lý', 1, '[{"added": {}}]', 3, 1);
INSERT INTO public.django_admin_log VALUES (3, '2025-05-14 15:26:48.452523+07', '1', 'Nhân viên', 2, '[]', 3, 1);
INSERT INTO public.django_admin_log VALUES (4, '2025-05-14 15:54:09.357169+07', '1', 'Nhân viên', 3, '', 3, 1);
INSERT INTO public.django_admin_log VALUES (5, '2025-05-14 15:54:26.065123+07', '3', 'Nhân viên', 1, '[{"added": {}}]', 3, 1);
INSERT INTO public.django_admin_log VALUES (6, '2025-05-14 16:09:56.943903+07', '3', 'Nhân viên', 2, '[]', 3, 1);


--
-- TOC entry 5368 (class 0 OID 29730)
-- Dependencies: 218
-- Data for Name: django_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.django_migrations VALUES (1, 'contenttypes', '0001_initial', '2025-05-14 14:25:13.522601+07');
INSERT INTO public.django_migrations VALUES (2, 'contenttypes', '0002_remove_content_type_name', '2025-05-14 14:25:13.532433+07');
INSERT INTO public.django_migrations VALUES (3, 'auth', '0001_initial', '2025-05-14 14:25:13.614702+07');
INSERT INTO public.django_migrations VALUES (4, 'auth', '0002_alter_permission_name_max_length', '2025-05-14 14:25:13.622734+07');
INSERT INTO public.django_migrations VALUES (5, 'auth', '0003_alter_user_email_max_length', '2025-05-14 14:25:13.631737+07');
INSERT INTO public.django_migrations VALUES (6, 'auth', '0004_alter_user_username_opts', '2025-05-14 14:25:13.645737+07');
INSERT INTO public.django_migrations VALUES (7, 'auth', '0005_alter_user_last_login_null', '2025-05-14 14:25:13.6566+07');
INSERT INTO public.django_migrations VALUES (8, 'auth', '0006_require_contenttypes_0002', '2025-05-14 14:25:13.659256+07');
INSERT INTO public.django_migrations VALUES (9, 'auth', '0007_alter_validators_add_error_messages', '2025-05-14 14:25:13.666006+07');
INSERT INTO public.django_migrations VALUES (10, 'auth', '0008_alter_user_username_max_length', '2025-05-14 14:25:13.675371+07');
INSERT INTO public.django_migrations VALUES (11, 'auth', '0009_alter_user_last_name_max_length', '2025-05-14 14:25:13.686021+07');
INSERT INTO public.django_migrations VALUES (12, 'auth', '0010_alter_group_name_max_length', '2025-05-14 14:25:13.695261+07');
INSERT INTO public.django_migrations VALUES (13, 'auth', '0011_update_proxy_permissions', '2025-05-14 14:25:13.699166+07');
INSERT INTO public.django_migrations VALUES (14, 'auth', '0012_alter_user_first_name_max_length', '2025-05-14 14:25:13.715015+07');
INSERT INTO public.django_migrations VALUES (15, 'users', '0001_initial', '2025-05-14 14:25:13.782763+07');
INSERT INTO public.django_migrations VALUES (16, 'admin', '0001_initial', '2025-05-14 14:25:13.822762+07');
INSERT INTO public.django_migrations VALUES (17, 'admin', '0002_logentry_remove_auto_add', '2025-05-14 14:25:13.835259+07');
INSERT INTO public.django_migrations VALUES (18, 'admin', '0003_logentry_add_action_flag_choices', '2025-05-14 14:25:13.848964+07');
INSERT INTO public.django_migrations VALUES (19, 'content', '0001_initial', '2025-05-14 14:25:13.92563+07');
INSERT INTO public.django_migrations VALUES (20, 'content', '0002_initial', '2025-05-14 14:25:14.173234+07');
INSERT INTO public.django_migrations VALUES (21, 'core', '0001_initial', '2025-05-14 14:25:14.189076+07');
INSERT INTO public.django_migrations VALUES (22, 'core', '0002_initial', '2025-05-14 14:25:14.223458+07');
INSERT INTO public.django_migrations VALUES (23, 'stores', '0001_initial', '2025-05-14 14:25:14.277792+07');
INSERT INTO public.django_migrations VALUES (24, 'products', '0001_initial', '2025-05-14 14:25:14.39118+07');
INSERT INTO public.django_migrations VALUES (25, 'inventory', '0001_initial', '2025-05-14 14:25:14.449944+07');
INSERT INTO public.django_migrations VALUES (26, 'inventory', '0002_initial', '2025-05-14 14:25:14.469564+07');
INSERT INTO public.django_migrations VALUES (27, 'inventory', '0003_initial', '2025-05-14 14:25:14.48316+07');
INSERT INTO public.django_migrations VALUES (28, 'inventory', '0004_initial', '2025-05-14 14:25:14.943074+07');
INSERT INTO public.django_migrations VALUES (29, 'orders', '0001_initial', '2025-05-14 14:25:15.015302+07');
INSERT INTO public.django_migrations VALUES (30, 'orders', '0002_initial', '2025-05-14 14:25:15.779392+07');
INSERT INTO public.django_migrations VALUES (31, 'products', '0002_initial', '2025-05-14 14:25:16.671196+07');
INSERT INTO public.django_migrations VALUES (32, 'reports', '0001_initial', '2025-05-14 14:25:16.68697+07');
INSERT INTO public.django_migrations VALUES (33, 'sessions', '0001_initial', '2025-05-14 14:25:16.709942+07');
INSERT INTO public.django_migrations VALUES (34, 'stores', '0002_initial', '2025-05-14 14:25:17.075544+07');
INSERT INTO public.django_migrations VALUES (35, 'warranty', '0001_initial', '2025-05-14 14:25:17.325251+07');
INSERT INTO public.django_migrations VALUES (36, 'products', '0003_remove_productimage_image_url_productimage_image_and_more', '2025-05-15 13:45:16.296395+07');
INSERT INTO public.django_migrations VALUES (37, 'content', '0003_remove_banner_image_url_banner_image_and_more', '2025-05-17 15:44:54.5474+07');
INSERT INTO public.django_migrations VALUES (38, 'content', '0004_alter_banner_image', '2025-05-17 15:44:54.607753+07');
INSERT INTO public.django_migrations VALUES (39, 'content', '0005_alter_banner_created_at_alter_banner_is_deleted_and_more', '2025-05-17 16:14:21.738974+07');
INSERT INTO public.django_migrations VALUES (40, 'core', '0003_alter_auditlog_created_at_alter_auditlog_is_deleted_and_more', '2025-05-17 16:14:21.952301+07');
INSERT INTO public.django_migrations VALUES (41, 'inventory', '0005_alter_inventory_created_at_and_more', '2025-05-17 16:14:22.868798+07');
INSERT INTO public.django_migrations VALUES (42, 'orders', '0003_alter_coupon_created_at_alter_coupon_is_deleted_and_more', '2025-05-17 16:14:23.632644+07');
INSERT INTO public.django_migrations VALUES (43, 'products', '0003_remove_brand_logo_url_alter_attributetype_created_at_and_more', '2025-05-17 16:14:24.789184+07');
INSERT INTO public.django_migrations VALUES (44, 'stores', '0003_alter_employee_created_at_alter_employee_is_deleted_and_more', '2025-05-17 16:14:25.382543+07');
INSERT INTO public.django_migrations VALUES (45, 'warranty', '0002_alter_warranty_created_at_alter_warranty_is_deleted_and_more', '2025-05-17 16:14:25.719984+07');


--
-- TOC entry 5445 (class 0 OID 30529)
-- Dependencies: 295
-- Data for Name: django_session; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5400 (class 0 OID 30015)
-- Dependencies: 250
-- Data for Name: employee; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5390 (class 0 OID 29881)
-- Dependencies: 240
-- Data for Name: footercategory; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.footercategory VALUES (2, false, '2025-05-17 21:15:19.004197+07', '2025-05-17 21:15:19.004197+07', 'Thông tin liên hệ', 2, true, NULL, NULL);
INSERT INTO public.footercategory VALUES (1, false, '2025-05-17 20:47:10.385834+07', '2025-05-17 21:15:26.357121+07', 'Về chúng tôi', 1, true, NULL, NULL);


--
-- TOC entry 5392 (class 0 OID 29887)
-- Dependencies: 242
-- Data for Name: footerlink; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.footerlink VALUES (1, false, '2025-05-17 20:49:38.161755+07', '2025-05-17 21:15:50.753977+07', 'duong dan', '/about', 1, NULL, 1, NULL, NULL);
INSERT INTO public.footerlink VALUES (2, false, '2025-05-17 21:16:20.946651+07', '2025-05-17 21:16:20.946651+07', 'dia chi', '/diachi', 1, true, 2, NULL, NULL);
INSERT INTO public.footerlink VALUES (3, false, '2025-05-17 21:18:17.961876+07', '2025-05-17 21:18:17.961876+07', 'bao hanh', '/baohanh', 2, true, 1, NULL, NULL);


--
-- TOC entry 5412 (class 0 OID 30073)
-- Dependencies: 262
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.product VALUES (12, false, '2025-05-17 16:14:24.226404+07', '2025-05-17 19:49:49.856856+07', 'patek philip', 'Mô tả sản phẩm', 1000000.00, 12, 'ten-san-pham', 'Meta title', 'Meta description', true, true, 1, 1, NULL, NULL);
INSERT INTO public.product VALUES (13, false, '2025-05-17 16:14:24.226404+07', '2025-05-17 19:50:10.633098+07', 'casio patek', 'Mô tả sản phẩm', 1000000.00, 12, 'ten-san-ph', 'Meta title', 'Meta description', true, true, 1, 1, NULL, NULL);
INSERT INTO public.product VALUES (14, false, '2025-05-17 16:14:24.226404+07', '2025-05-17 19:50:31.112658+07', 'rolex gold pre', 'Mô tả sản phẩm', 1000000.00, 12, 'ten-san-', 'Meta title', 'Meta description', true, true, 1, 1, NULL, NULL);
INSERT INTO public.product VALUES (16, false, '2025-05-17 16:14:24.226404+07', '2025-05-17 19:51:02.482604+07', 'reolox platinum', 'Mô tả sản phẩm', 1000000.00, 12, 'ten-sa', 'Meta title', 'Meta description', true, true, 1, 1, NULL, NULL);
INSERT INTO public.product VALUES (11, false, '2025-05-17 16:14:24.226404+07', '2025-05-17 19:51:25.20468+07', 'casio smart', 'gfđsfdsf', 7546546.00, 43, 'fđfgfdgfg', '', '', false, true, 1, 1, NULL, NULL);
INSERT INTO public.product VALUES (4, false, '2025-05-17 16:14:24.226404+07', '2025-05-17 19:51:47.881483+07', 'Đồng hồ Casio gold', '', 200000.00, 122, 'dsadsad', 'fdsf', 'fdsfdsf', false, false, 1, 1, NULL, NULL);
INSERT INTO public.product VALUES (10, false, '2025-05-17 16:14:24.226404+07', '2025-05-17 19:52:19.540035+07', 'patek philip limited', 'Product Description', 1000.00, 12, 'fdsfdg', '', '', true, true, 1, 1, NULL, NULL);
INSERT INTO public.product VALUES (17, false, '2025-05-17 16:14:24.226404+07', '2025-05-17 19:53:39.544404+07', 'Patek Philip Diamond', 'gdfgfdg', 546545.00, 45, 'gfhgfh', '', '', false, true, 1, 1, NULL, NULL);
INSERT INTO public.product VALUES (5, false, '2025-05-17 16:14:24.226404+07', '2025-05-17 19:54:30.400606+07', 'Đồng hồ Casio chất', '', 200000.00, 12, '4234', 'fdsfd', 'dsfdsf', false, false, 1, 1, NULL, NULL);
INSERT INTO public.product VALUES (7, false, '2025-05-17 16:14:24.226404+07', '2025-05-17 19:52:05.478118+07', 'casio silver', 'Product Description', 1000.00, 12, '12', 'sds', 'fsad', true, true, 1, 1, NULL, NULL);
INSERT INTO public.product VALUES (6, false, '2025-05-17 16:14:24.226404+07', '2025-05-17 19:52:35.345763+07', 'Đồng hồ Casio diamond', '', 200000.00, 12, '32', 'fdsfd', 'fdsf', false, false, 1, 2, NULL, NULL);
INSERT INTO public.product VALUES (8, false, '2025-05-17 16:14:24.226404+07', '2025-05-17 19:52:58.76139+07', 'henz quiz ta', 'Product Description', 1000.00, 12, 'ds', '', '', true, true, 1, 1, NULL, NULL);
INSERT INTO public.product VALUES (9, false, '2025-05-17 16:14:24.226404+07', '2025-05-17 19:54:03.899288+07', 'Casio Sport', 'Product Description', 1000.00, 12, 'fg', '', '', true, true, 1, 1, NULL, NULL);
INSERT INTO public.product VALUES (3, false, '2025-05-17 16:14:24.226404+07', '2025-05-17 19:55:00.703408+07', 'Nhieu dong ho', '', 1000000.00, 32, 'dfsdfgf', '', '', false, true, 1, 2, NULL, NULL);
INSERT INTO public.product VALUES (18, false, '2025-05-17 16:14:24.226404+07', '2025-05-17 19:55:21.167314+07', 'Dong ho cuc xin', '', 1543543.00, 12, 'dgfdg', '', '', false, true, 1, 1, NULL, NULL);


--
-- TOC entry 5416 (class 0 OID 30091)
-- Dependencies: 266
-- Data for Name: productvariant; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.productvariant VALUES (1, false, '2025-05-17 16:14:24.596133+07', '2025-05-17 16:14:24.710777+07', 'VARIANT-001', 10.50, 5, '123456789', true, NULL, 3, NULL);


--
-- TOC entry 5402 (class 0 OID 30025)
-- Dependencies: 252
-- Data for Name: store; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5422 (class 0 OID 30121)
-- Dependencies: 272
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5424 (class 0 OID 30127)
-- Dependencies: 274
-- Data for Name: inventorytransaction; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5396 (class 0 OID 29905)
-- Dependencies: 246
-- Data for Name: newscategory; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5394 (class 0 OID 29895)
-- Dependencies: 244
-- Data for Name: news; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5436 (class 0 OID 30273)
-- Dependencies: 286
-- Data for Name: orders_customer; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5440 (class 0 OID 30287)
-- Dependencies: 290
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5438 (class 0 OID 30281)
-- Dependencies: 288
-- Data for Name: orderdetail; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5414 (class 0 OID 30083)
-- Dependencies: 264
-- Data for Name: productimage; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.productimage VALUES (1, false, '2025-05-17 16:14:24.406242+07', '2025-05-17 16:14:24.53603+07', false, 'ut in ad dolor', 1, NULL, 3, NULL, 1, 'products/ong-ho-casio_None.png');
INSERT INTO public.productimage VALUES (2, false, '2025-05-17 16:14:24.406242+07', '2025-05-17 16:14:24.53603+07', false, 'ut in ad dolor', 1, NULL, 3, NULL, 1, 'products/ong-ho-casio_None_GkocwbE.png');
INSERT INTO public.productimage VALUES (4, false, '2025-05-17 16:14:24.406242+07', '2025-05-17 16:14:24.53603+07', false, NULL, NULL, NULL, 16, NULL, NULL, 'products/ten-san-pham_None_mJuTEzD.png');
INSERT INTO public.productimage VALUES (10, false, '2025-05-17 19:48:52.420057+07', '2025-05-17 19:48:52.421057+07', true, NULL, NULL, NULL, 10, NULL, NULL, 'products/product-name_None.webp');
INSERT INTO public.productimage VALUES (11, false, '2025-05-17 19:49:12.559916+07', '2025-05-17 19:49:12.561897+07', true, NULL, NULL, NULL, 11, NULL, NULL, 'products/gdfdsf_None.webp');
INSERT INTO public.productimage VALUES (12, false, '2025-05-17 19:49:49.876561+07', '2025-05-17 19:49:49.878553+07', true, NULL, NULL, NULL, 12, NULL, NULL, 'products/patek-philip_None.webp');
INSERT INTO public.productimage VALUES (13, false, '2025-05-17 19:50:10.65391+07', '2025-05-17 19:50:10.655991+07', true, NULL, NULL, NULL, 13, NULL, NULL, 'products/casio-patek_None.webp');
INSERT INTO public.productimage VALUES (14, false, '2025-05-17 19:50:31.129827+07', '2025-05-17 19:50:31.130822+07', true, NULL, NULL, NULL, 14, NULL, NULL, 'products/rolex-gold-pre_None.webp');
INSERT INTO public.productimage VALUES (3, false, '2025-05-17 16:14:24.406242+07', '2025-05-17 16:14:24.53603+07', false, NULL, NULL, NULL, 16, NULL, NULL, 'products/ten-san-pham_None.png');
INSERT INTO public.productimage VALUES (15, false, '2025-05-17 19:51:02.513523+07', '2025-05-17 19:51:02.515517+07', true, NULL, NULL, NULL, 16, NULL, NULL, 'products/reolox-platinum_None.webp');
INSERT INTO public.productimage VALUES (7, false, '2025-05-17 16:14:24.406242+07', '2025-05-17 16:14:24.53603+07', false, NULL, NULL, NULL, 4, NULL, NULL, 'products/ong-ho-casio_None_vM6iPmn.png');
INSERT INTO public.productimage VALUES (16, false, '2025-05-17 19:51:47.906044+07', '2025-05-17 19:51:47.908054+07', true, NULL, NULL, NULL, 4, NULL, NULL, 'products/ong-ho-casio-gold_None.webp');
INSERT INTO public.productimage VALUES (17, false, '2025-05-17 19:52:05.497127+07', '2025-05-17 19:52:05.498131+07', true, NULL, NULL, NULL, 7, NULL, NULL, 'products/casio-silver_None.webp');
INSERT INTO public.productimage VALUES (18, false, '2025-05-17 19:52:35.364003+07', '2025-05-17 19:52:35.366008+07', true, NULL, NULL, NULL, 6, NULL, NULL, 'products/ong-ho-casio-diamond_None.webp');
INSERT INTO public.productimage VALUES (19, false, '2025-05-17 19:52:58.780698+07', '2025-05-17 19:52:58.782696+07', true, NULL, NULL, NULL, 8, NULL, NULL, 'products/henz-quiz-ta_None.webp');
INSERT INTO public.productimage VALUES (5, false, '2025-05-17 16:14:24.406242+07', '2025-05-17 16:14:24.53603+07', false, NULL, NULL, NULL, 17, NULL, NULL, 'products/gfdgdfgfd_None.png');
INSERT INTO public.productimage VALUES (20, false, '2025-05-17 19:53:39.568718+07', '2025-05-17 19:53:39.57072+07', true, NULL, NULL, NULL, 17, NULL, NULL, 'products/patek-philip-diamond_None.webp');
INSERT INTO public.productimage VALUES (21, false, '2025-05-17 19:54:03.917954+07', '2025-05-17 19:54:03.919972+07', true, NULL, NULL, NULL, 9, NULL, NULL, 'products/casio-sport_None.webp');
INSERT INTO public.productimage VALUES (8, false, '2025-05-17 16:14:24.406242+07', '2025-05-17 16:14:24.53603+07', false, NULL, NULL, NULL, 5, NULL, NULL, 'products/ong-ho-casio_None_5y1Tzxf.png');
INSERT INTO public.productimage VALUES (22, false, '2025-05-17 19:54:30.42236+07', '2025-05-17 19:54:30.424377+07', true, NULL, NULL, NULL, 5, NULL, NULL, 'products/ong-ho-casio-chat_None.webp');
INSERT INTO public.productimage VALUES (6, false, '2025-05-17 16:14:24.406242+07', '2025-05-17 16:14:24.53603+07', false, NULL, NULL, NULL, 3, NULL, NULL, 'products/ten-san-pham-moi_None.png');
INSERT INTO public.productimage VALUES (23, false, '2025-05-17 19:55:00.732441+07', '2025-05-17 19:55:00.733953+07', true, NULL, NULL, NULL, 3, NULL, NULL, 'products/nhieu-dong-ho_None.webp');
INSERT INTO public.productimage VALUES (24, false, '2025-05-17 19:55:00.744983+07', '2025-05-17 19:55:00.744983+07', false, NULL, NULL, NULL, 3, NULL, NULL, 'products/nhieu-dong-ho_None_R3b9Uwz.webp');
INSERT INTO public.productimage VALUES (25, false, '2025-05-17 19:55:00.753525+07', '2025-05-17 19:55:00.753525+07', false, NULL, NULL, NULL, 3, NULL, NULL, 'products/nhieu-dong-ho_None_V2CrACR.webp');
INSERT INTO public.productimage VALUES (26, false, '2025-05-17 19:55:00.761899+07', '2025-05-17 19:55:00.761899+07', false, NULL, NULL, NULL, 3, NULL, NULL, 'products/nhieu-dong-ho_None_sWZEro1.webp');
INSERT INTO public.productimage VALUES (27, false, '2025-05-17 19:55:00.77192+07', '2025-05-17 19:55:00.77192+07', false, NULL, NULL, NULL, 3, NULL, NULL, 'products/nhieu-dong-ho_None_E8axnOf.webp');
INSERT INTO public.productimage VALUES (9, false, '2025-05-17 16:14:24.406242+07', '2025-05-17 16:14:24.53603+07', false, NULL, NULL, NULL, 18, NULL, NULL, 'products/dong-ho-cuc-xin_None.png');
INSERT INTO public.productimage VALUES (28, false, '2025-05-17 19:55:21.191004+07', '2025-05-17 19:55:21.193008+07', true, NULL, NULL, NULL, 18, NULL, NULL, 'products/dong-ho-cuc-xin_None.webp');


--
-- TOC entry 5418 (class 0 OID 30099)
-- Dependencies: 268
-- Data for Name: productvariantattribute; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5442 (class 0 OID 30295)
-- Dependencies: 292
-- Data for Name: returnorder; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5444 (class 0 OID 30303)
-- Dependencies: 294
-- Data for Name: returnorderdetail; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5426 (class 0 OID 30135)
-- Dependencies: 276
-- Data for Name: stocktake; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5428 (class 0 OID 30143)
-- Dependencies: 278
-- Data for Name: stocktakedetail; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5430 (class 0 OID 30151)
-- Dependencies: 280
-- Data for Name: stocktransfer; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5432 (class 0 OID 30159)
-- Dependencies: 282
-- Data for Name: stocktransferdetail; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5404 (class 0 OID 30035)
-- Dependencies: 254
-- Data for Name: supplier; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5380 (class 0 OID 29802)
-- Dependencies: 230
-- Data for Name: useraccount_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.useraccount_groups VALUES (4, 6, 3);
INSERT INTO public.useraccount_groups VALUES (5, 7, 3);
INSERT INTO public.useraccount_groups VALUES (6, 1, 2);
INSERT INTO public.useraccount_groups VALUES (7, 8, 3);
INSERT INTO public.useraccount_groups VALUES (8, 9, 2);
INSERT INTO public.useraccount_groups VALUES (9, 10, 4);
INSERT INTO public.useraccount_groups VALUES (10, 11, 4);
INSERT INTO public.useraccount_groups VALUES (11, 7, 2);
INSERT INTO public.useraccount_groups VALUES (12, 7, 4);
INSERT INTO public.useraccount_groups VALUES (13, 4, 5);
INSERT INTO public.useraccount_groups VALUES (15, 4, 2);


--
-- TOC entry 5382 (class 0 OID 29808)
-- Dependencies: 232
-- Data for Name: useraccount_user_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5447 (class 0 OID 30581)
-- Dependencies: 297
-- Data for Name: warranty; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5449 (class 0 OID 30587)
-- Dependencies: 299
-- Data for Name: warrantyclaim; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5455 (class 0 OID 0)
-- Dependencies: 255
-- Name: attributetype_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attributetype_id_seq', 1, false);


--
-- TOC entry 5456 (class 0 OID 0)
-- Dependencies: 269
-- Name: attributevalue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attributevalue_id_seq', 1, false);


--
-- TOC entry 5457 (class 0 OID 0)
-- Dependencies: 247
-- Name: audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_log_id_seq', 141, true);


--
-- TOC entry 5458 (class 0 OID 0)
-- Dependencies: 223
-- Name: auth_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_group_id_seq', 5, true);


--
-- TOC entry 5459 (class 0 OID 0)
-- Dependencies: 225
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_group_permissions_id_seq', 148, true);


--
-- TOC entry 5460 (class 0 OID 0)
-- Dependencies: 221
-- Name: auth_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_permission_id_seq', 160, true);


--
-- TOC entry 5461 (class 0 OID 0)
-- Dependencies: 235
-- Name: banner_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.banner_id_seq', 3, true);


--
-- TOC entry 5462 (class 0 OID 0)
-- Dependencies: 257
-- Name: brand_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.brand_id_seq', 4, true);


--
-- TOC entry 5463 (class 0 OID 0)
-- Dependencies: 259
-- Name: category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.category_id_seq', 10, true);


--
-- TOC entry 5464 (class 0 OID 0)
-- Dependencies: 237
-- Name: contactinfo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contactinfo_id_seq', 1, false);


--
-- TOC entry 5465 (class 0 OID 0)
-- Dependencies: 283
-- Name: coupon_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.coupon_id_seq', 1, false);


--
-- TOC entry 5466 (class 0 OID 0)
-- Dependencies: 233
-- Name: django_admin_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_admin_log_id_seq', 6, true);


--
-- TOC entry 5467 (class 0 OID 0)
-- Dependencies: 219
-- Name: django_content_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_content_type_id_seq', 40, true);


--
-- TOC entry 5468 (class 0 OID 0)
-- Dependencies: 217
-- Name: django_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_migrations_id_seq', 45, true);


--
-- TOC entry 5469 (class 0 OID 0)
-- Dependencies: 249
-- Name: employee_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employee_id_seq', 1, false);


--
-- TOC entry 5470 (class 0 OID 0)
-- Dependencies: 239
-- Name: footercategory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.footercategory_id_seq', 2, true);


--
-- TOC entry 5471 (class 0 OID 0)
-- Dependencies: 241
-- Name: footerlink_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.footerlink_id_seq', 3, true);


--
-- TOC entry 5472 (class 0 OID 0)
-- Dependencies: 271
-- Name: inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventory_id_seq', 1, false);


--
-- TOC entry 5473 (class 0 OID 0)
-- Dependencies: 273
-- Name: inventorytransaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventorytransaction_id_seq', 1, false);


--
-- TOC entry 5474 (class 0 OID 0)
-- Dependencies: 243
-- Name: news_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.news_id_seq', 1, false);


--
-- TOC entry 5475 (class 0 OID 0)
-- Dependencies: 245
-- Name: newscategory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.newscategory_id_seq', 1, false);


--
-- TOC entry 5476 (class 0 OID 0)
-- Dependencies: 287
-- Name: orderdetail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orderdetail_id_seq', 1, false);


--
-- TOC entry 5477 (class 0 OID 0)
-- Dependencies: 285
-- Name: orders_customer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_customer_id_seq', 1, false);


--
-- TOC entry 5478 (class 0 OID 0)
-- Dependencies: 289
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, false);


--
-- TOC entry 5479 (class 0 OID 0)
-- Dependencies: 261
-- Name: product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_id_seq', 18, true);


--
-- TOC entry 5480 (class 0 OID 0)
-- Dependencies: 263
-- Name: productimage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productimage_id_seq', 28, true);


--
-- TOC entry 5481 (class 0 OID 0)
-- Dependencies: 265
-- Name: productvariant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productvariant_id_seq', 1, true);


--
-- TOC entry 5482 (class 0 OID 0)
-- Dependencies: 267
-- Name: productvariantattribute_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productvariantattribute_id_seq', 1, false);


--
-- TOC entry 5483 (class 0 OID 0)
-- Dependencies: 291
-- Name: returnorder_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.returnorder_id_seq', 1, false);


--
-- TOC entry 5484 (class 0 OID 0)
-- Dependencies: 293
-- Name: returnorderdetail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.returnorderdetail_id_seq', 1, false);


--
-- TOC entry 5485 (class 0 OID 0)
-- Dependencies: 275
-- Name: stocktake_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stocktake_id_seq', 1, false);


--
-- TOC entry 5486 (class 0 OID 0)
-- Dependencies: 277
-- Name: stocktakedetail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stocktakedetail_id_seq', 1, false);


--
-- TOC entry 5487 (class 0 OID 0)
-- Dependencies: 279
-- Name: stocktransfer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stocktransfer_id_seq', 1, false);


--
-- TOC entry 5488 (class 0 OID 0)
-- Dependencies: 281
-- Name: stocktransferdetail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stocktransferdetail_id_seq', 1, false);


--
-- TOC entry 5489 (class 0 OID 0)
-- Dependencies: 251
-- Name: store_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.store_id_seq', 1, false);


--
-- TOC entry 5490 (class 0 OID 0)
-- Dependencies: 253
-- Name: supplier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.supplier_id_seq', 1, false);


--
-- TOC entry 5491 (class 0 OID 0)
-- Dependencies: 229
-- Name: useraccount_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.useraccount_groups_id_seq', 15, true);


--
-- TOC entry 5492 (class 0 OID 0)
-- Dependencies: 227
-- Name: useraccount_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.useraccount_id_seq', 11, true);


--
-- TOC entry 5493 (class 0 OID 0)
-- Dependencies: 231
-- Name: useraccount_user_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.useraccount_user_permissions_id_seq', 1, false);


--
-- TOC entry 5494 (class 0 OID 0)
-- Dependencies: 296
-- Name: warranty_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.warranty_id_seq', 1, false);


--
-- TOC entry 5495 (class 0 OID 0)
-- Dependencies: 298
-- Name: warrantyclaim_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.warrantyclaim_id_seq', 1, false);


-- Completed on 2025-05-17 21:53:48

--
-- PostgreSQL database dump complete
--

