#!/usr/bin/env python3
import json
import re
from datetime import datetime
from icalendar import Calendar

INPUT_FILE = "canvas_output.txt"
OUTPUT_FILE = "canvas_events.json"

def normalize_date(dt):
    if not dt:
        return None
    if isinstance(dt, datetime):
        return dt.date().isoformat()
    dt = str(dt)
    return dt.split("T")[0] if "T" in dt else dt

def detect_course(title):
    match = re.search(r"\[([A-Z]+\d+)", title)
    return match.group(1) if match else None

def detect_type(title, desc):
    text = f"{title} {desc}".lower()
    if "exam" in text or "midterm" in text or "final" in text:
        return "Exam"
    elif "quiz" in text:
        return "Quiz"
    elif "assignment" in text:
        return "Assignment"
    elif "discussion" in text:
        return "Discussion"
    else:
        return "Other"

def clean_title(title):
    return re.sub(r"\[.*?\]", "", title).strip()

def clean_description(desc):
    desc = desc.replace("\u00a0", " ")
    desc = re.sub(r"\[(.*?)\]\s+\((.*?)\)", r"[\1](\2)", desc)
    return desc.strip()

def parse_ics(path):
    with open(path, "r", encoding="utf-8") as f:
        cal = Calendar.from_ical(f.read())

    events = []
    for c in cal.walk():
        if c.name != "VEVENT":
            continue

        raw_title = str(c.get("SUMMARY"))
        title = clean_title(raw_title)
        desc = clean_description(str(c.get("DESCRIPTION", "")))
        start = normalize_date(c.get("DTSTART").dt)
        url = str(c.get("URL", ""))
        uid = str(c.get("UID", ""))

        events.append({
            "uid": uid,
            "title": title,
            "course": detect_course(raw_title),
            "type": detect_type(title, desc),
            "description": desc,
            "due_date": start,
            "url": url
        })
    return events

if __name__ == "__main__":
    events = parse_ics(INPUT_FILE)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(events, f, indent=2)
    print(f"Parsed {len(events)} events into {OUTPUT_FILE}")
