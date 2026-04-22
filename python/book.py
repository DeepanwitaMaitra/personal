class Chapter:
    def __init__(self, title, author):
        self.title = title
        self.author = author
class Book:
    def __init__(self, chapters):
        self.chapters = chapters
    def total_page(self):
        total=0
        for chapter in self.chapters: #counts each chapters in self.chapter list and adds the page number to total
            total+=chapter.page
        return total
c1 = Chapter("abc", "Author A")
c2 = Chapter("bcd", "Author B")
c3 = Chapter("cde", "Author C")
print(Book.total_page(Book([c1,c2,c3])))