import json
from datetime import datetime

FILE = "tasks.json"

def load_tasks():
    try:
        with open(FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []
    except json.JSONDecodeError:
        print("Error: tasks file is corrupted. Starting with an empty list.")
        return []


def save_tasks(tasks):
    with open(FILE, "w") as f:
        json.dump(tasks, f, indent=4)


def add_task():
    title = input("Task title: ").strip()

    while True:
        priority = input("Priority (High/Medium/Low): ").strip().lower()
        if priority in {"high", "medium", "low"}:
            break
        print("Priority must be High, Medium, or Low.")

    while True:
        deadline = input("Deadline (YYYY-MM-DD): ").strip()
        try:
            datetime.strptime(deadline, "%Y-%m-%d")
            break
        except ValueError:
            print("Invalid date format. Please use YYYY-MM-DD.")

    task = {
        "title": title,
        "priority": priority,
        "deadline": deadline,
        "completed": False
    }

    tasks = load_tasks()
    tasks.append(task)
    save_tasks(tasks)

    print("Task added!\n")


def sort_tasks(tasks):
    priority_order = {"high": 1, "medium": 2, "low": 3}

    def task_key(task):
        try:
            deadline = datetime.strptime(task.get("deadline", ""), "%Y-%m-%d")
        except ValueError:
            deadline = datetime.max
        return (
            priority_order.get(task.get("priority", ""), 4),
            deadline
        )

    return sorted(tasks, key=task_key)


def view_tasks(tasks=None):
    if tasks is None:
        tasks = load_tasks()

    if not tasks:
        print("No tasks found.\n")
        return []

    tasks = sort_tasks(tasks)

    for i, t in enumerate(tasks):
        status = "✓" if t.get("completed") else "✗"
        print(f"{i+1}. {t.get('title', '')} | {t.get('priority', '')} | {t.get('deadline', '')} | {status}")
    print()
    return tasks


def mark_complete():
    tasks = load_tasks()
    if not tasks:
        print("No tasks found.\n")
        return

    sorted_tasks = view_tasks(tasks)

    try:
        idx = int(input("Enter task number: ")) - 1
    except ValueError:
        print("Invalid number.\n")
        return

    if 0 <= idx < len(sorted_tasks):
        sorted_tasks[idx]["completed"] = True
        save_tasks(sorted_tasks)
        print("Marked as complete!\n")
    else:
        print("Invalid choice\n")


def delete_task():
    tasks = load_tasks()
    if not tasks:
        print("No tasks found.\n")
        return

    sorted_tasks = view_tasks(tasks)

    try:
        idx = int(input("Enter task number to delete: ")) - 1
    except ValueError:
        print("Invalid number.\n")
        return

    if 0 <= idx < len(sorted_tasks):
        sorted_tasks.pop(idx)
        save_tasks(sorted_tasks)
        print("Deleted!\n")
    else:
        print("Invalid choice\n")


if __name__ == "__main__":
    while True:
        print("1. Add  2. View  3. Complete  4. Delete  5. Exit")
        ch = input("Choice: ").strip()

        if ch == '1':
            add_task()
        elif ch == '2':
            view_tasks()
        elif ch == '3':
            mark_complete()
        elif ch == '4':
            delete_task()
        elif ch == '5':
            break
        else:
            print("Invalid input\n")