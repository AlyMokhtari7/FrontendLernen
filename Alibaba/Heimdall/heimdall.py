import json
import os.path
import re
import typing
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler


class MyHandler(FileSystemEventHandler):
    def on_modified(self, event):
        print(f'event type: {event.event_type}  path : {event.src_path}')

def look_for_changes():
    event_handler = MyHandler()
    observer = Observer()
    observer.schedule(event_handler, path=os.path.join('../src/'), recursive=False)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

def compile_files(main_file_path:str, src:str, dest:str):
    pages_pattern = r"\[\[pages\.([a-zA-Z0-9_-]+\.html)\]\]"
    resources_pattern =r"\[\[r\.((?:global|this))\.((?:bitmaps|svgs|strings|paths))\.([a-zA-Z0-9 _\.-]+)\]\]"

    ##### Compile pages ######
    with open(main_file_path, 'r', encoding="utf-8") as main_file_object:
        main_file_content = main_file_object.read()
        matches = re.findall(pages_pattern, main_file_content)
        with open("resources.json", "r", encoding="utf-8") as res_file_object:
            resources = json.load(res_file_object)
            for match in matches:
                with open(os.path.join(src, "markups", match), 'r', encoding="utf-8") as page_file:
                    page_content = page_file.read()
                    ##### Apply resources
                    res_matches = re.findall(resources_pattern, page_content)
                    for res_match in res_matches:
                        scope = "global" if res_match[0] == "global" else match
                        page_content = page_content.replace("[[r." + ".".join(res_match) + ']]', resources[scope][res_match[1]][res_match[2]])
                    main_file_content = main_file_content.replace(f"[[pages.{match}]]", page_content)
        ##### Add styles and scripts pages ######
        # style_files_list = [f for f in os.listdir(os.path.join(src,"css")) if os.path.isfile(os.path.join(src,"css", f))]
        style_files_list = ["styles.css", "tablet-styles.css", "fablet-styles.css", "mobile-styles.css", "utils.css"]
        styles = ""
        for style_file in style_files_list:
            with open(os.path.join(src,"css", style_file), 'r', encoding="utf-8") as style_file_object:
                styles_content = style_file_object.read()
                styles += styles_content
        styles = "<style>" + styles + "</style>"
        main_file_content = main_file_content.replace(f"[[files.styles]]", styles)

        scripts_files_list = [f for f in os.listdir(os.path.join(src,"scripts")) if os.path.isfile(os.path.join(src,"scripts", f))]
        scripts = ""
        for script_file in scripts_files_list:
            with open(os.path.join(src,"scripts", script_file), 'r', encoding="utf-8") as script_file_object:
                scripts_content = script_file_object.read()
                scripts += scripts_content
        scripts = "<script>" + scripts + "</script>"
        main_file_content = main_file_content.replace(f"[[files.scripts]]", scripts)


        with open(os.path.join(dest,"output.html"), 'w+', encoding="utf-8") as dest_file_object:
            dest_file_object.write(main_file_content)

if __name__ == "__main__":

    root = "D:\\Projects\\Lernen\\Alibaba"
    src = os.path.join(root,'src')
    main_file = os.path.join(src,"markups",'main.html')
    dest_folder = os.path.join(root,'out')

    # look_for_changes()
    compile_files(main_file, src=src, dest=dest_folder)
