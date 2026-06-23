-- CreateTable
CREATE TABLE "ClickEvent" (
    "id" TEXT NOT NULL,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceType" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "country" TEXT,
    "city" TEXT,
    "ipAddress" TEXT,
    "referrer" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "linkId" TEXT NOT NULL,

    CONSTRAINT "ClickEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClickEvent_linkId_clickedAt_idx" ON "ClickEvent"("linkId", "clickedAt");

-- CreateIndex
CREATE INDEX "ClickEvent_linkId_country_idx" ON "ClickEvent"("linkId", "country");

-- CreateIndex
CREATE INDEX "ClickEvent_linkId_deviceType_idx" ON "ClickEvent"("linkId", "deviceType");

-- AddForeignKey
ALTER TABLE "ClickEvent" ADD CONSTRAINT "ClickEvent_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;
