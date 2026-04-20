USE `vroom`;

ALTER TABLE house ADD COLUMN IF NOT EXISTS TotalPriceWan INT NULL;
ALTER TABLE price ADD COLUMN IF NOT EXISTS TotalPriceWan INT NULL;

UPDATE house
SET TotalPriceWan = CASE
    WHEN TotalPrice IS NULL OR TRIM(TotalPrice) = '' THEN NULL
    WHEN TotalPrice LIKE '%億%' THEN ROUND(CAST(NULLIF(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(TotalPrice), '億', ''), ',', ''), '元', ''), ' ', ''), '') AS DECIMAL(10,2)) * 10000)
    WHEN TotalPrice LIKE '%萬%' THEN ROUND(CAST(NULLIF(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(TotalPrice), '萬', ''), ',', ''), '元', ''), ' ', ''), '') AS DECIMAL(10,2)))
    ELSE CASE
        WHEN CAST(NULLIF(REPLACE(REPLACE(REPLACE(TRIM(TotalPrice), ',', ''), '元', ''), ' ', ''), '') AS UNSIGNED) >= 100000
            THEN ROUND(CAST(NULLIF(REPLACE(REPLACE(REPLACE(TRIM(TotalPrice), ',', ''), '元', ''), ' ', ''), '') AS UNSIGNED) / 10000)
        ELSE CAST(NULLIF(REPLACE(REPLACE(REPLACE(TRIM(TotalPrice), ',', ''), '元', ''), ' ', ''), '') AS UNSIGNED)
    END
END
WHERE TotalPriceWan IS NULL OR TotalPriceWan = 0;

UPDATE house
SET TotalPrice = CONCAT(FORMAT(TotalPriceWan, 0), '萬')
WHERE TotalPriceWan IS NOT NULL;

UPDATE price
SET TotalPriceWan = CASE
    WHEN TotalPrice IS NULL OR TRIM(TotalPrice) = '' THEN NULL
    WHEN TotalPrice LIKE '%億%' THEN ROUND(CAST(NULLIF(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(TotalPrice), '億', ''), ',', ''), '元', ''), ' ', ''), '') AS DECIMAL(10,2)) * 10000)
    WHEN TotalPrice LIKE '%萬%' THEN ROUND(CAST(NULLIF(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(TotalPrice), '萬', ''), ',', ''), '元', ''), ' ', ''), '') AS DECIMAL(10,2)))
    ELSE CASE
        WHEN CAST(NULLIF(REPLACE(REPLACE(REPLACE(TRIM(TotalPrice), ',', ''), '元', ''), ' ', ''), '') AS UNSIGNED) >= 100000
            THEN ROUND(CAST(NULLIF(REPLACE(REPLACE(REPLACE(TRIM(TotalPrice), ',', ''), '元', ''), ' ', ''), '') AS UNSIGNED) / 10000)
        ELSE CAST(NULLIF(REPLACE(REPLACE(REPLACE(TRIM(TotalPrice), ',', ''), '元', ''), ' ', ''), '') AS UNSIGNED)
    END
END
WHERE TotalPriceWan IS NULL OR TotalPriceWan = 0;

UPDATE price
SET TotalPrice = CONCAT(FORMAT(TotalPriceWan, 0), '萬')
WHERE TotalPriceWan IS NOT NULL;

UPDATE searchfilters sf
JOIN house h ON h.houseID = sf.houseID
SET sf.PriceRange = CASE
    WHEN h.TotalPriceWan < 1000 THEN '1000萬以下'
    WHEN h.TotalPriceWan < 1500 THEN '1000萬 - 1500萬'
    WHEN h.TotalPriceWan < 2000 THEN '1500萬 - 2000萬'
    WHEN h.TotalPriceWan < 3000 THEN '2000萬 - 3000萬'
    WHEN h.TotalPriceWan < 4000 THEN '3000萬 - 4000萬'
    ELSE '4000萬以上'
END
WHERE h.TotalPriceWan IS NOT NULL;
