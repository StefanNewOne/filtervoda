-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "chips" TEXT[] DEFAULT ARRAY[]::TEXT[];
