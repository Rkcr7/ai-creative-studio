-- CreateTable
CREATE TABLE "brand_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "guidelines" TEXT,
    "logo_preview" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "generated_assets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profile_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "prompt_used" TEXT NOT NULL,
    "aspect_ratio" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "generated_assets_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "brand_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
