 #include <SFML/Graphics.hpp>
#include "Ball.h"
#include "Bat.h"
#include<sstream>
using namespace sf;

int main() {
    VideoMode vm(1280, 720);
    RenderWindow window(vm, "Pong Game");

    Ball ball(1280/2, 0);
    Bat bat(1280/2, 700);  // 720 - 20 = near bottom

    Clock clock;
 int score=0;
 int live=3;
 Font font;
 font.loadFromFile("/home/iteradmin/KOMIKAP_.ttf");
 Text hud;
 hud.setFont(font);
 hud.setCharacterSize(30);
 hud.setFillColor(Color::White);
 hud.setPosition(20,20);
 
 
 
    while (window.isOpen()) {
        Time dt = clock.restart();

        Event event;
        while (window.pollEvent(event)) {
            if (event.type == Event::Closed) {
                window.close();
            }
            std::stringstream ss;
            ss<<"Score:"<<score<<"live:"<<live;
            hud.setString(ss.str());
            
            window.clear();
            window.draw(hud);
            window.draw(ball.getShape());
            window.draw(bat.getShape());
            
            
            
            
          
            if (event.type == Event::KeyPressed) {
                if (event.key.code == Keyboard::Escape) {
                    window.close();
                }
                if (event.key.code == Keyboard::Left) {
                    bat.moveLeft();
                }
                if (event.key.code == Keyboard::Right) {
                    bat.moveRight();
                }
            }
            if (event.type == Event::KeyReleased) {
                if (event.key.code == Keyboard::Left) {
                    bat.stopLeft();
                }
                if (event.key.code == Keyboard::Right) {
                    bat.stopRight();
                }
            }
        }
     
        // Ball boundary checks
        FloatRect ballPos = ball.getPosition();

        // Left or right wall
        if (ballPos.left <= 0 || ballPos.left + ballPos.width >= 1280) {
            ball.reboundSides();
        }

        // Top wall
        if (ballPos.top <= 0) {
            ball.reboundBatOrTop();
        }

        // Ball hits bat
        if (ballPos.intersects(bat.getPosition())) {
            ball.reboundBatOrTop();
        }

        // Ball hits bottom - reset
        if (ballPos.top + ballPos.height >= 720) {
            ball.reboundBottom();
        }

        ball.update(dt);
        bat.update(dt);

        window.clear(Color::Black);
        window.draw(ball.getShape());
        window.draw(bat.getShape());
        window.display();
    }

    return 0;
}