CREATE TABLE `users` (
  `internal_id` int NOT NULL AUTO_INCREMENT,
  `logto_id` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone_no` varchar(20) DEFAULT NULL,
  `nickname` varchar(100) DEFAULT NULL,
  `gender` enum('male','female','other','secret') DEFAULT 'secret',
  `birthday` date DEFAULT NULL,
  `default_currency` varchar(3) DEFAULT 'USD',
  `role` enum('customer','VIP','staff','admin') DEFAULT 'customer',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `email_notifications` tinyint(1) DEFAULT '1',
  `push_notifications` tinyint(1) DEFAULT '0',
  `sms_notifications` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`internal_id`),
  UNIQUE KEY `logto_id` (`logto_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

insert into fastec.users(logto_id,password,email,phone_no,nickname,gender,birthday,default_currency,role,created_at,deleted_at,last_login,`isActive`,email_notifications,push_notifications,sms_notifications) values 
    ('xo7bikrxxfbk',null,'lukasgaogao@outlook.com','01001010101','Tim','male',DATE '2000-01-01','USD','admin',TIMESTAMP '2026-02-06 17:06:28.000',null,TIMESTAMP '2026-03-11 09:48:56.000','1','0','0','0')
  , ('string',null,'user@example.com',null,'user','secret',null,'USD','customer',TIMESTAMP '2026-02-12 17:23:07.000',null,TIMESTAMP '2026-02-12 17:23:07.000','1','1','0','0');

CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `parent_id` int DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

insert into fastec.categories(name,parent_id,image_url) values 
    ('Electronics',null,null)
  , ('Daily Essentials',null,null);

CREATE TABLE `currencies` (
  `currency_code` varchar(3) NOT NULL,
  `currency_symbol` varchar(5) NOT NULL,
  `exchange_rate` decimal(12,4) NOT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`currency_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

insert into fastec.currencies(currency_code,currency_symbol,exchange_rate,is_default) values 
    ('CNY','¥',6.9000,'0')
  , ('EUR','€',1.2000,'0')
  , ('JPY','¥',155.0000,'0')
  , ('USD','$',1.0000,'1');

CREATE TABLE `products` (
  `product_id` varchar(50) NOT NULL,
  `category_id` int DEFAULT NULL,
  `brand_id` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `base_price` decimal(12,2) NOT NULL,
  `currency_code` varchar(3) DEFAULT 'USD',
  `tax_class` enum('Standard','Reduced','Zero') DEFAULT 'Standard',
  `stock_quantity` int DEFAULT '0',
  `sku_internal_code` varchar(100) DEFAULT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `origin_country` varchar(50) DEFAULT NULL,
  `weight` float DEFAULT NULL,
  `dimensions` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `isActive` tinyint(1) DEFAULT '1',
  `discount_factor` decimal(3,2) DEFAULT '1.00',
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `sku_internal_code` (`sku_internal_code`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

insert into fastec.products(product_id,category_id,brand_id,title,description,base_price,currency_code,tax_class,stock_quantity,sku_internal_code,barcode,origin_country,weight,dimensions,created_at,`isActive`,discount_factor) values 
    ('prod_001',1,null,'Smartphone Alpha',null,4000.00,'JPY','Standard',92,null,null,null,null,null,TIMESTAMP '2026-02-17 00:00:00.000','1',0.85)
  , ('prod_002',2,null,'Zojirushi Vacuum Flask',null,150.00,'USD','Standard',50,null,null,null,null,null,TIMESTAMP '2026-02-17 00:00:00.000','1',1.00)
  , ('prod_003',1,null,'Legacy Wired Earbuds',null,200.00,'CNY','Standard',10,null,null,null,null,null,TIMESTAMP '2026-02-17 00:00:00.000','1',0.70);

CREATE TABLE `product_images` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `product_id` varchar(50) DEFAULT NULL,
  `image_url` text NOT NULL,
  `sort_order` int DEFAULT '0',
  PRIMARY KEY (`image_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

insert into fastec.product_images(product_id,image_url,sort_order) values 
    ('prod_001','https://example.com/phone.jpg',0);

CREATE TABLE `product_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` varchar(50) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `rating` tinyint DEFAULT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `product_reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  CONSTRAINT `product_reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`internal_id`),
  CONSTRAINT `product_reviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `cart_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` varchar(100) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

insert into fastec.cart_items(user_id,product_id,quantity,updated_at) values 
    ('xo7bikrxxfbk','prod_001',1,TIMESTAMP '2026-03-16 16:33:59.000')
  , ('xo7bikrxxfbk','prod_002',1,TIMESTAMP '2026-03-16 16:34:00.000')
  , ('xo7bikrxxfbk','prod_003',2,TIMESTAMP '2026-03-16 16:34:12.000');

CREATE TABLE `orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_no` varchar(20) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` varchar(20) DEFAULT 'PAID',
  `tracking_number` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `address_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `order_no` (`order_no`),
  KEY `idx_orders_user_id` (`user_id`),
  KEY `idx_orders_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

insert into fastec.orders(order_no,user_id,currency,total_price,status,tracking_number,created_at,updated_at) values 
    ('20260226000001','xo7bikrxxfbk','¥',3740.00,'PAID',null,TIMESTAMP '2026-02-26 03:43:30.000',TIMESTAMP '2026-02-26 03:43:30.000',1)
  , ('20260226000002','xo7bikrxxfbk','¥',3740.00,'PAID',null,TIMESTAMP '2026-02-26 03:46:39.000',TIMESTAMP '2026-02-26 03:46:39.000',1)
  , ('20260309000001','xo7bikrxxfbk','¥',3740.00,'PAID',null,TIMESTAMP '2026-03-09 01:17:48.000',TIMESTAMP '2026-03-09 01:17:48.000',1)
  , ('20260309000002','xo7bikrxxfbk','¥',3740.00,'PAID',null,TIMESTAMP '2026-03-09 02:09:18.000',TIMESTAMP '2026-03-09 02:09:18.000',2)
  , ('20260309000003','xo7bikrxxfbk','¥',3740.00,'PAID',null,TIMESTAMP '2026-03-09 05:13:30.000',TIMESTAMP '2026-03-09 05:13:30.000',2)
  , ('20260309000004','xo7bikrxxfbk','¥',11220.00,'SHIPPED',null,TIMESTAMP '2026-03-09 05:14:05.000',TIMESTAMP '2026-03-09 05:14:05.000',2);

CREATE TABLE `order_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `idx_order_items_order_id` (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

insert into fastec.order_items(order_id,product_id,product_name,image_url,quantity,unit_price) values 
    (3,'prod_001','Smartphone Alpha','https://example.com/phone.jpg',1,3740.00)
  , (4,'prod_001','Smartphone Alpha','https://example.com/phone.jpg',1,3740.00)
  , (5,'prod_001','Smartphone Alpha','https://example.com/phone.jpg',1,3740.00)
  , (6,'prod_001','Smartphone Alpha','https://example.com/phone.jpg',1,3740.00)
  , (7,'prod_001','Smartphone Alpha','https://example.com/phone.jpg',1,3740.00)
  , (8,'prod_001','Smartphone Alpha','https://example.com/phone.jpg',3,3740.00);

CREATE TABLE `refund_requests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `reason` varchar(100) NOT NULL,
  `details` text,
  `status` varchar(20) DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `shipping_addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `logto_id` varchar(128) NOT NULL,
  `tag` varchar(50) DEFAULT NULL,
  `recipient_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `country_code` varchar(2) DEFAULT NULL,
  `zip_code` varchar(20) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `address_line` text,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`logto_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

insert into fastec.shipping_addresses(logto_id,tag,recipient_name,phone,country_code,zip_code,state,city,address_line,is_default,created_at,updated_at) values 
    ('xo7bikrxxfbk','Home','Tim','123123123','JP','1000000',null,'Tokyo','ffffffffffffffffffffffffaaaaaaaaaaaaaaaaaaaaaaatokyo','0',TIMESTAMP '2026-02-16 16:19:24.000',TIMESTAMP '2026-03-16 17:07:56.000')
  , ('xo7bikrxxfbk','Company','Tim','1234567890987','CN','1000001',null,'shanghai','AAAAAAAAABBBBBBBBBBCCCCCCCCCCDDD','0',TIMESTAMP '2026-02-16 16:20:21.000',TIMESTAMP '2026-03-16 17:08:04.000');

CREATE TABLE `support_tickets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ticket_type` varchar(20) NOT NULL,
  `order_id` varchar(50) NOT NULL,
  `user_id` varchar(100) NOT NULL,
  `reason` varchar(100) DEFAULT NULL,
  `details` text NOT NULL,
  `status` varchar(20) DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

insert into fastec.support_tickets(ticket_type,order_id,user_id,reason,details,status,created_at,updated_at) values 
    ('CONTACT','20260309000004','xo7bikrxxfbk','General Inquiry','hello','FINISHED',TIMESTAMP '2026-03-16 11:09:00.000',TIMESTAMP '2026-03-17 03:31:49.000')
  , ('REFUND','20260309000003','xo7bikrxxfbk','defective','not  goodnot  goodnot  goodnot  goodnot  goodnot  goodnot  goodnot  good','PENDING',TIMESTAMP '2026-03-16 11:09:23.000',TIMESTAMP '2026-03-16 11:09:23.000');

CREATE TABLE `tax_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `country_code` varchar(2) NOT NULL,
  `tax_class` enum('Standard','Reduced','Zero') DEFAULT NULL,
  `tax_rate` decimal(5,4) NOT NULL,
  `is_show_inclusive` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `country_code` (`country_code`,`tax_class`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

insert into fastec.tax_settings(country_code,tax_class,tax_rate,is_show_inclusive) values 
    ('CN','Standard',0.1300,'0')
  , ('JP','Standard',0.1000,'1')
  , ('US','Standard',0.1000,'1')
  , ('EU','Standard',0.0800,'1');


