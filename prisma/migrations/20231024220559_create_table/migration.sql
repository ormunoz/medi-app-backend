-- CreateEnum
CREATE TYPE "Role" AS ENUM ('1', '2');

-- CreateTable
CREATE TABLE "personal_informations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,

    CONSTRAINT "personal_informations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "role" "Role" NOT NULL DEFAULT '2',
    "personal_information_id" INTEGER NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "user_name" TEXT NOT NULL,
    "especiality" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT '1',
    "personal_information_id" INTEGER NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "option" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,

    CONSTRAINT "option_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patients_email_key" ON "patients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_user_name_key" ON "admins"("user_name");

-- CreateIndex
CREATE UNIQUE INDEX "admins_especiality_key" ON "admins"("especiality");

-- CreateIndex
CREATE UNIQUE INDEX "questions_question_key" ON "questions"("question");

-- CreateIndex
CREATE UNIQUE INDEX "option_text_key" ON "option"("text");

-- CreateIndex
CREATE UNIQUE INDEX "option_score_key" ON "option"("score");

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_personal_information_id_fkey" FOREIGN KEY ("personal_information_id") REFERENCES "personal_informations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_personal_information_id_fkey" FOREIGN KEY ("personal_information_id") REFERENCES "personal_informations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "option" ADD CONSTRAINT "option_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
