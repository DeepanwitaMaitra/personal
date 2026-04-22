class Time:
    def __init__(self, time):
        self.time = time

    def is_valid(self):
        try:
            h, m, s = map(int, self.time.split(":"))  # splits the time string into hours, minutes, and seconds and converts them to integers
            return 0 <= h < 24 and 0 <= m < 60 and 0 <= s < 60
        except:
            return False

    def for_12hr(self):
        if not self.is_valid():
            return "Invalid time"
        else:
            h, m, s = map(int, self.time.split(":"))
            period = "AM" if h < 12 else "PM"
            if h==0:
                  h = 12
            else:
                    h = h - 12 or 12
        return f"{h}:{m}:{s} {period}"

t = Time("14:30:10")
print(t.for_12hr())

    