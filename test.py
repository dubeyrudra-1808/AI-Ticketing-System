import google.generativeai as genai

genai.configure(api_key="AIzaSyAermDiexIaqHMqS-FghSclJxUMDRbg8vE")

models = genai.list_models()

print("Available models for this API key:")
for model in models:
    print(model.name)
