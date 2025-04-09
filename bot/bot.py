from aiogram import Bot, Dispatcher, types, executor
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, WebAppInfo
from dotenv import load_dotenv
import os

load_dotenv()
bot = Bot(token=os.getenv("BOT_TOKEN"))
dp = Dispatcher(bot)

# 💬 Кнопка Web App
main_kb = ReplyKeyboardMarkup(resize_keyboard=True)
main_kb.add(KeyboardButton(
    text="🧩 Играть в пазл",
    web_app=WebAppInfo(url="https://zerloxxx.github.io/puzzle-telegram-app/?v=999")
))

# 🔁 Команда /start
@dp.message_handler(commands=['start'])
async def start_handler(message: types.Message):
    await message.answer("Привет! Готов сыграть в пазл? Жми кнопку ниже👇", reply_markup=main_kb)

# 📥 Обработка данных от Web App (например, код)
@dp.message_handler(content_types=['web_app_data'])
async def handle_webapp_data(message: types.Message):
    code = message.web_app_data.data
    await message.answer(f"🎉 Ты прошёл игру и получил код: {code}")

# ▶️ Запуск
if __name__ == "__main__":
    executor.start_polling(dp, skip_updates=True)

