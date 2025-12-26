-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: tramway.proxy.rlwy.net    Database: railway
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `restaurant_id` int NOT NULL,
  `agent_id` int DEFAULT NULL,
  `items` json NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `order_id` varchar(255) DEFAULT NULL,
  `payment_type` varchar(50) DEFAULT NULL,
  `estimated_delivery` varchar(50) DEFAULT NULL,
  `status` enum('Pending','waiting_for_agent','agent_assigned','Confirmed','Preparing','Ready','Picked Up','Delivered','Cancelled') DEFAULT 'Pending',
  `delivery_address` varchar(500) DEFAULT NULL,
  `delivery_lat` decimal(10,8) DEFAULT NULL,
  `delivery_lng` decimal(11,8) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tracking_status` enum('waiting','agent_assigned','agent_going_to_restaurant','arrived_at_restaurant','picked_up','in_transit','delivered') DEFAULT 'waiting',
  `agent_assigned_at` timestamp NULL DEFAULT NULL,
  `picked_up_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `customer_phone` varchar(20) DEFAULT NULL,
  `restaurant_phone` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`),
  KEY `user_id` (`user_id`),
  KEY `restaurant_id` (`restaurant_id`),
  KEY `agent_id` (`agent_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,26,6,NULL,'[{\"name\": \"shewarma\", \"price\": 560, \"quantity\": 1}]',590.00,NULL,NULL,NULL,'Pending',NULL,NULL,NULL,NULL,'2025-12-19 15:48:48','2025-12-19 15:48:48','waiting',NULL,NULL,NULL,NULL,NULL),(2,6,6,NULL,'[{\"name\": \"idli\", \"price\": 89, \"quantity\": 1}, {\"name\": \"shewarma\", \"price\": 560, \"quantity\": 1}]',679.00,NULL,NULL,NULL,'Pending',NULL,NULL,NULL,NULL,'2025-12-20 05:41:07','2025-12-20 05:41:07','waiting',NULL,NULL,NULL,NULL,NULL),(3,6,6,NULL,'[{\"name\": \"idli\", \"price\": 89, \"quantity\": 2}, {\"name\": \"shewarma\", \"price\": 560, \"quantity\": 2}]',1328.00,NULL,NULL,NULL,'Pending',NULL,NULL,NULL,NULL,'2025-12-20 05:42:41','2025-12-20 05:42:41','waiting',NULL,NULL,NULL,NULL,NULL),(6,28,6,NULL,'[{\"name\": \"idli\", \"price\": 89, \"quantity\": 2}, {\"name\": \"shewarma\", \"price\": 560, \"quantity\": 1}]',768.00,NULL,NULL,NULL,'Pending',NULL,NULL,NULL,NULL,'2025-12-21 09:49:21','2025-12-21 09:49:21','waiting',NULL,NULL,NULL,NULL,NULL),(7,6,9,NULL,'[{\"name\": \"biryani\", \"price\": 455, \"quantity\": 1}]',485.00,'328176313458','COD','30-35 mins','Pending',NULL,NULL,NULL,NULL,'2025-12-22 17:23:24','2025-12-22 17:23:24','waiting',NULL,NULL,NULL,NULL,NULL),(8,30,1,1,'[{\"name\": \"mklre\", \"price\": 544, \"quantity\": 1}]',574.00,'599610966457','COD','30-35 mins','Confirmed',NULL,NULL,NULL,NULL,'2025-12-22 18:53:09','2025-12-22 18:53:09','waiting',NULL,NULL,NULL,NULL,NULL),(9,30,1,1,'[{\"name\": \"mklre\", \"price\": 544, \"quantity\": 1}]',574.00,'876254574964','COD','30-35 mins','Confirmed',NULL,NULL,NULL,NULL,'2025-12-23 04:21:12','2025-12-23 04:21:12','waiting',NULL,NULL,NULL,NULL,NULL),(10,6,10,2,'[{\"name\": \"idli\", \"price\": 894, \"quantity\": 1}]',924.00,'827880027738','COD','30-35 mins','Confirmed',NULL,NULL,NULL,NULL,'2025-12-23 12:32:37','2025-12-23 12:32:37','waiting',NULL,NULL,NULL,NULL,NULL),(11,30,1,2,'[{\"name\": \"mklre\", \"price\": 544, \"quantity\": 1}]',574.00,'611511904410','COD','30-35 mins','Confirmed',NULL,NULL,NULL,NULL,'2025-12-23 14:54:04','2025-12-23 14:54:04','waiting',NULL,NULL,NULL,NULL,NULL),(12,30,1,1,'[{\"name\": \"mklre\", \"price\": 544, \"quantity\": 1}]',574.00,'959328205580','COD','30-35 mins','Confirmed',NULL,NULL,NULL,NULL,'2025-12-26 09:09:09','2025-12-26 09:09:09','waiting',NULL,NULL,NULL,NULL,NULL),(13,32,1,NULL,'[{\"name\": \"mklre\", \"price\": 544, \"quantity\": 3}]',1662.00,'221913055180','COD','30-35 mins','waiting_for_agent',NULL,NULL,NULL,NULL,'2025-12-26 10:19:32','2025-12-26 10:19:32','waiting',NULL,NULL,NULL,NULL,NULL),(14,32,1,NULL,'[{\"name\": \"mklre\", \"price\": 544, \"quantity\": 2}]',1118.00,'907533013262','COD','30-35 mins','waiting_for_agent',NULL,NULL,NULL,NULL,'2025-12-26 10:27:20','2025-12-26 10:27:20','waiting',NULL,NULL,NULL,NULL,NULL),(15,6,1,NULL,'[{\"name\": \"mklre\", \"price\": 544, \"quantity\": 1}]',574.00,'986323565972','COD','30-35 mins','waiting_for_agent',NULL,NULL,NULL,NULL,'2025-12-26 11:21:04','2025-12-26 11:21:04','waiting',NULL,NULL,NULL,NULL,NULL),(16,6,1,NULL,'[{\"name\": \"mklre\", \"price\": 544, \"quantity\": 1}]',574.00,'600139248482','COD','30-35 mins','waiting_for_agent',NULL,NULL,NULL,NULL,'2025-12-26 11:32:33','2025-12-26 11:32:33','waiting',NULL,NULL,NULL,NULL,NULL),(17,6,1,NULL,'[{\"name\": \"mklre\", \"price\": 544, \"quantity\": 1}]',574.00,'476164126370','COD','30-35 mins','waiting_for_agent',NULL,NULL,NULL,NULL,'2025-12-26 12:01:09','2025-12-26 12:01:09','waiting',NULL,NULL,NULL,NULL,NULL),(18,6,1,NULL,'[{\"name\": \"mklre\", \"price\": 544, \"quantity\": 1}]',574.00,'836853967894','COD','30-35 mins','waiting_for_agent',NULL,NULL,NULL,NULL,'2025-12-26 12:01:15','2025-12-26 12:01:15','waiting',NULL,NULL,NULL,NULL,NULL),(19,30,1,NULL,'[{\"name\": \"mklre\", \"price\": 544, \"quantity\": 1}]',574.00,'539434969630','COD','30-35 mins','waiting_for_agent',NULL,NULL,NULL,NULL,'2025-12-26 12:02:08','2025-12-26 12:02:08','waiting',NULL,NULL,NULL,NULL,NULL),(20,30,1,NULL,'[{\"name\": \"mklre\", \"price\": 544, \"quantity\": 2}]',1118.00,'602894694505','COD','30-35 mins','waiting_for_agent',NULL,NULL,NULL,NULL,'2025-12-26 12:26:30','2025-12-26 12:26:30','waiting',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-26 19:33:26
