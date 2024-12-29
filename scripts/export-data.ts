import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function exportData() {
  // Export addons
  const foods = await prisma.food.findMany()
  const addons = await prisma.addon.findMany()
  const variants = await prisma.foodVariant.findMany()
  const categories = await prisma.category.findMany()
  const pointsSystem = await prisma.pointsSystem.findMany()
  const restaurants = await prisma.restaurant.findMany()
  const promotions = await prisma.promotion.findMany()
  // Create a backup directory if it doesn't exist
  const backupDir = path.join(__dirname, '../backup')
  if (!fs.existsSync(backupDir)){
    fs.mkdirSync(backupDir, { recursive: true })
  }

  // Save to JSON file
  fs.writeFileSync(
    path.join(backupDir, 'food.json'), 
    JSON.stringify(foods, null, 2)
  )
  fs.writeFileSync(
    path.join(backupDir, 'addons.json'), 
    JSON.stringify(addons, null, 2)
  )
  fs.writeFileSync(
    path.join(backupDir, 'variants.json'), 
    JSON.stringify(variants, null, 2)
  )
  fs.writeFileSync(
    path.join(backupDir, 'categories.json'), 
    JSON.stringify(categories, null, 2)
  )
  fs.writeFileSync(
    path.join(backupDir, 'points-system.json'), 
    JSON.stringify(pointsSystem, null, 2)
  )

  console.log('Data exported successfully!')
}

exportData()
  .catch(console.error)
  .finally(() => prisma.$disconnect()) 