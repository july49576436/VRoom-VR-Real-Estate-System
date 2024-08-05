CREATE DATABASE  IF NOT EXISTS `vroom` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `vroom`;
-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: vroom
-- ------------------------------------------------------
-- Server version	5.7.44-log

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
-- Table structure for table `community_planning`
--

DROP TABLE IF EXISTS `community_planning`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `community_planning` (
  `community_ID` int(11) NOT NULL AUTO_INCREMENT,
  `houseID` int(11) NOT NULL,
  `PublicFacilityRatio` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `BuildingRage` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `SiteArea` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ParkingRatio` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ParkingType` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `BuildingInfo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `FloorPlanning` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Orientation` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `BuildingPermit` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `UsagePermit` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `BuildingMaterial` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PublicFacilities` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ManagementFee` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `LandUseZoning` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Propertymanagement` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `man_committee` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `constructure` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`community_ID`),
  KEY `fk_community_planning` (`houseID`),
  CONSTRAINT `fk_community_planning` FOREIGN KEY (`houseID`) REFERENCES `house` (`houseID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `community_planning`
--

LOCK TABLES `community_planning` WRITE;
/*!40000 ALTER TABLE `community_planning` DISABLE KEYS */;
INSERT INTO `community_planning` VALUES (1,1,'33%','35.2%','140.2坪','1:1:6','機械式5個','1棟，1樓，4戶住家','地上6層，地下2層','朝東、朝西','106建字第0090號','109使字第0025號','RC鋼構','健身房、接待大廳','40~60元/坪','第三種住宅區','有','民國109年成立','RC鋼筋混凝土結構');
/*!40000 ALTER TABLE `community_planning` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-08-05 21:17:53
