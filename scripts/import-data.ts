import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function importData() {
  // Read the backup file
  const addonsData = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../backup/addons.json'), 
      'utf-8'
    )
  )

  const variantsData = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../backup/variants.json'), 
      'utf-8'
    )
  )

  const categoriesData = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../backup/categories.json'), 
      'utf-8'
    )
  )

  const foodsData = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../backup/food.json'), 
      'utf-8'
    )
  )

  // Import addons
  for (const addon of addonsData) {
    await prisma.addon.create({
      data: addon
    })
  }

  for (const variant of variantsData) {
    await prisma.foodVariant.create({
      data: variant
    })
  }

  for (const category of categoriesData) {
    await prisma.category.create({
      data: category
    })
  }

  for (const food of foodsData) {
    await prisma.food.create({
      data: food
    })
  }

  console.log('Data imported successfully!')
}

importData()
  .catch(console.error)
  .finally(() => prisma.$disconnect()) 