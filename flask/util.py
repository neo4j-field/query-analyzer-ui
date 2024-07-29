# import os
# import time
# from typing import Any

# import dotenv

# dotenv.load_dotenv()
# from openai import OpenAI
# import tiktoken


# MAX_TOKENS = int(os.environ["MAX_TOKENS"])


# def num_tokens_from_string(string: str) -> int:
#     """Returns the number of tokens in a text string."""
#     encoding = tiktoken.get_encoding(os.environ["OPENAI_ENCODING"])
#     return len(encoding.encode(string))


# def header_rows_to_csv_string(headers: list[str], rows: list[list[Any]]):
#     s = ",".join(headers)
#     for row in rows:
#         s += "\n" + ",".join([f"{x}" for x in row])
#     return s


def format_seconds(seconds):
    if seconds < 0:
        raise ValueError("Seconds cannot be negative")

    # Round seconds to the nearest integer
    seconds = round(seconds)

    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    remaining_seconds = seconds % 60

    if hours > 0:
        return f"{hours}:{minutes:02d}:{remaining_seconds:02d}"
    else:
        return f"{minutes}:{remaining_seconds:02d}"


# def openai_percentile_question(
#     openai_client: OpenAI, headers: list[str], rows: list[list[Any]]
# ):
#     csv_str = header_rows_to_csv_string(headers, rows)

#     question = f"""
#     Given this csv, what are some key things you notice, like outliers?

#     {csv_str}
#     """

#     num_tokens = num_tokens_from_string(question)
#     print(f"{num_tokens} tokens")
#     if num_tokens > MAX_TOKENS:
#         exit(f"Exiting - exceeds {MAX_TOKENS}")

#     question_lines = question.split("\n")
#     if len(question_lines) > 10:
#         to_print = "\n".join(question_lines[:15]) + "\n....."
#     else:
#         to_print = question
#     print(f"QUESTION\n{to_print}\n")

#     print("Asking openai...")
#     start = time.time()
#     completion = openai_client.chat.completions.create(
#         model="gpt-4o-mini",
#         messages=[
#             {
#                 "role": "system",
#                 "content": "You are a concise, to-the-point assistant.",
#             },
#             {
#                 "role": "user",
#                 "content": question,
#             },
#         ],
#     )
#     print(f"... took {time.time() - start:.3f} seconds")
#     time.sleep(2)

#     content = completion.choices[0].message.content
#     print(f"\n{content}")
