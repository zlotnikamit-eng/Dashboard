-- CreateTable
CREATE TABLE "AppConfig" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "classId" TEXT NOT NULL,
    "displayName" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncStatus" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawLessonSnapshot" (
    "id" TEXT NOT NULL,
    "tab" TEXT NOT NULL,
    "weekOffset" INTEGER NOT NULL DEFAULT 0,
    "dayIndex" INTEGER NOT NULL,
    "periodNumber" INTEGER NOT NULL,
    "periodStart" TEXT,
    "periodEnd" TEXT,
    "subject" TEXT NOT NULL,
    "room" TEXT,
    "teacher" TEXT,
    "signature" TEXT NOT NULL,
    "rawHtml" TEXT,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RawLessonSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawChangeSnapshot" (
    "id" TEXT NOT NULL,
    "tab" TEXT NOT NULL,
    "weekOffset" INTEGER NOT NULL DEFAULT 0,
    "dayIndex" INTEGER NOT NULL,
    "periodNumber" INTEGER NOT NULL,
    "changeType" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "matchedSignature" TEXT,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RawChangeSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalSlot" (
    "id" TEXT NOT NULL,
    "dayIndex" INTEGER NOT NULL,
    "periodNumber" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "room" TEXT,
    "teacher" TEXT,
    "signature" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeEvent" (
    "id" TEXT NOT NULL,
    "personalSlotId" TEXT,
    "dayIndex" INTEGER NOT NULL,
    "periodNumber" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pushedAt" TIMESTAMP(3),
    "pushStatus" TEXT,

    CONSTRAINT "ChangeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "subject" TEXT,
    "dayIndex" INTEGER,
    "periodNumber" INTEGER,
    "personalSlotId" TEXT,
    "dueDate" TIMESTAMP(3),
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RawLessonSnapshot_tab_weekOffset_dayIndex_periodNumber_idx" ON "RawLessonSnapshot"("tab", "weekOffset", "dayIndex", "periodNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RawLessonSnapshot_tab_weekOffset_dayIndex_periodNumber_sign_key" ON "RawLessonSnapshot"("tab", "weekOffset", "dayIndex", "periodNumber", "signature");

-- CreateIndex
CREATE INDEX "RawChangeSnapshot_tab_weekOffset_dayIndex_periodNumber_idx" ON "RawChangeSnapshot"("tab", "weekOffset", "dayIndex", "periodNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalSlot_dayIndex_periodNumber_signature_key" ON "PersonalSlot"("dayIndex", "periodNumber", "signature");

-- CreateIndex
CREATE INDEX "ChangeEvent_detectedAt_idx" ON "ChangeEvent"("detectedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "Task_dueDate_idx" ON "Task"("dueDate");

-- CreateIndex
CREATE INDEX "Task_done_idx" ON "Task"("done");

-- AddForeignKey
ALTER TABLE "ChangeEvent" ADD CONSTRAINT "ChangeEvent_personalSlotId_fkey" FOREIGN KEY ("personalSlotId") REFERENCES "PersonalSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_personalSlotId_fkey" FOREIGN KEY ("personalSlotId") REFERENCES "PersonalSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
