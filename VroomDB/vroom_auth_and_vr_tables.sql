USE `vroom`;

-- 管理者帳號表（登入）
CREATE TABLE IF NOT EXISTS `manager` (
  `managerID` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`managerID`),
  UNIQUE KEY `uk_manager_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 建案模型主表
CREATE TABLE IF NOT EXISTS `house_model` (
  `houseModelID` int(11) NOT NULL AUTO_INCREMENT,
  `houseID` int(11) NOT NULL,
  PRIMARY KEY (`houseModelID`),
  KEY `fk_house_model_house` (`houseID`),
  CONSTRAINT `fk_house_model_house` FOREIGN KEY (`houseID`) REFERENCES `house` (`houseID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 樓層模型與初始座標
CREATE TABLE IF NOT EXISTS `house_model_floors` (
  `houseModelFloorsID` int(11) NOT NULL AUTO_INCREMENT,
  `houseModelID` int(11) NOT NULL,
  `houseModelFloorsFileName` varchar(255) DEFAULT NULL,
  `houseModelFloorInitX` decimal(10,4) DEFAULT 0,
  `houseModelFloorInitY` decimal(10,4) DEFAULT 0,
  `houseModelFloorInitZ` decimal(10,4) DEFAULT 0,
  PRIMARY KEY (`houseModelFloorsID`),
  KEY `fk_house_model_floors` (`houseModelID`),
  CONSTRAINT `fk_house_model_floors` FOREIGN KEY (`houseModelID`) REFERENCES `house_model` (`houseModelID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 360 圖片與熱點座標
CREATE TABLE IF NOT EXISTS `house_model_floors_360` (
  `houseModelFloors360ID` int(11) NOT NULL AUTO_INCREMENT,
  `houseModelFloorsID` int(11) NOT NULL,
  `houseModelFloors360FileName` varchar(255) DEFAULT NULL,
  `houseModelFloors360InitX` decimal(10,4) DEFAULT 0,
  `houseModelFloors360InitY` decimal(10,4) DEFAULT 0,
  `houseModelFloors360InitZ` decimal(10,4) DEFAULT 0,
  PRIMARY KEY (`houseModelFloors360ID`),
  KEY `fk_house_model_floors_360` (`houseModelFloorsID`),
  CONSTRAINT `fk_house_model_floors_360` FOREIGN KEY (`houseModelFloorsID`) REFERENCES `house_model_floors` (`houseModelFloorsID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 預設管理者（如帳號已存在則跳過）
INSERT INTO `manager` (`username`, `password`)
SELECT 'admin', 'admin123'
WHERE NOT EXISTS (
  SELECT 1 FROM `manager` WHERE `username` = 'admin'
);

-- 預設 3D 模型資料（houseID=1）
INSERT INTO `house_model` (`houseID`)
SELECT 1
WHERE NOT EXISTS (
  SELECT 1 FROM `house_model` WHERE `houseID` = 1
);

INSERT INTO `house_model_floors` (
  `houseModelID`,
  `houseModelFloorsFileName`,
  `houseModelFloorInitX`,
  `houseModelFloorInitY`,
  `houseModelFloorInitZ`
)
SELECT hm.houseModelID, 'poly_2.glb', 0, 1.6, 2
FROM `house_model` hm
WHERE hm.houseID = 1
  AND NOT EXISTS (
    SELECT 1
    FROM `house_model_floors` hmf
    WHERE hmf.houseModelID = hm.houseModelID
  );

INSERT INTO `house_model_floors_360` (
  `houseModelFloorsID`,
  `houseModelFloors360FileName`,
  `houseModelFloors360InitX`,
  `houseModelFloors360InitY`,
  `houseModelFloors360InitZ`
)
SELECT hmf.houseModelFloorsID, 'livingroom.jpg', 0, 1.6, 0
FROM `house_model_floors` hmf
JOIN `house_model` hm ON hm.houseModelID = hmf.houseModelID
WHERE hm.houseID = 1
  AND NOT EXISTS (
    SELECT 1
    FROM `house_model_floors_360` t
    WHERE t.houseModelFloorsID = hmf.houseModelFloorsID
  );
