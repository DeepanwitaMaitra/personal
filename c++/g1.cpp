#include <SFML/Graphics.hpp>
#include <SFML/Audio.hpp>
#include <sstream>
using namespace sf;

void updateBranches(int seed);
const int NUMBER_BRANCHES = 6;
Sprite branches[NUMBER_BRANCHES];
enum class side { LEFT, RIGHT, NONE };
side branchPositions[NUMBER_BRANCHES];

int main() {
    VideoMode vm(960, 540);
    RenderWindow window(vm, "Timber");

    View view(FloatRect(0, 0, 1920, 1080));
    window.setView(view);
    srand((int)time(0));
  
    Texture textureBackground;
    textureBackground.loadFromFile("/home/iteradmin/shanvi/graphics/background.png");
    Sprite spriteBackground;
    spriteBackground.setTexture(textureBackground);
    spriteBackground.setPosition(0, 0);

    Texture textureTree;
    textureTree.loadFromFile("/home/iteradmin/shanvi/graphics/tree.png");
    Sprite spriteTree;
    spriteTree.setTexture(textureTree);
    spriteTree.setPosition(810, 0);

    Texture texturePlayer;
    texturePlayer.loadFromFile("/home/iteradmin/shanvi/graphics/player.png");
    Sprite spritePlayer;
    spritePlayer.setTexture(texturePlayer);
    spritePlayer.setPosition(580, 720);
    side playerSide = side::LEFT;

    Texture textureAxe;
    textureAxe.loadFromFile("/home/iteradmin/shanvi/graphics/axe.png");
    Sprite spriteAxe;
    spriteAxe.setTexture(textureAxe);
    spriteAxe.setPosition(2000, 830); 
    const float AXE_POSITION_LEFT = 700;
    const float AXE_POSITION_RIGHT = 1075;

    Texture textureLog;
    textureLog.loadFromFile("/home/iteradmin/shanvi/graphics/log.png");
    Sprite spriteLog;
    spriteLog.setTexture(textureLog);
    spriteLog.setPosition(810, 720);
    bool logActive = false;
    float logSpeedX = 1000;
    float logSpeedY = -1500;

    Texture textureRIP;
    textureRIP.loadFromFile("/home/iteradmin/shanvi/graphics/rip.png");
    Sprite spriteRIP;
    spriteRIP.setTexture(textureRIP);
    spriteRIP.setPosition(600, 2000);

    Texture textureBee;
    textureBee.loadFromFile("/home/iteradmin/shanvi/graphics/bee.png");
    Sprite spriteBee;
    spriteBee.setTexture(textureBee);
    bool beeActive = false;
    float beeSpeed = 0.0f;

    Texture textureCloud;
    textureCloud.loadFromFile("/home/iteradmin/shanvi/graphics/cloud.png");
    Sprite clouds[3];
    bool cloudActive[3] = {false, false, false};
    float cloudSpeed[3] = {0, 0, 0};
    for (int i = 0; i < 3; i++) {
        clouds[i].setTexture(textureCloud);
        clouds[i].setPosition(-300, i * 150);
    }

    Texture textureBranch;
    textureBranch.loadFromFile("/home/iteradmin/shanvi/graphics/branch.png");
    for (int i = 0; i < NUMBER_BRANCHES; i++) {
        branches[i].setTexture(textureBranch);
        branches[i].setPosition(-2000, -2000);
        branches[i].setOrigin(220, 20);
    }
    Font font;
    font.loadFromFile("/home/iteradmin/shanvi/graphics/KOMIKAP_.ttf");
    Text messageText, scoreText;
    messageText.setFont(font);
    scoreText.setFont(font);
    messageText.setString("Press Enter to start");
    scoreText.setString("Score = 0");
    messageText.setCharacterSize(75);
    scoreText.setCharacterSize(100);
    messageText.setFillColor(Color::White);
    scoreText.setFillColor(Color::Red);
    
 
    FloatRect textRect = messageText.getLocalBounds();
    messageText.setOrigin(textRect.left + textRect.width / 2.0f, textRect.top + textRect.height / 2.0f);
    messageText.setPosition(1920 / 2.0f, 1080 / 2.0f);
    scoreText.setPosition(20, 20);

    RectangleShape timeBar;
    float timeBarStartWidth = 400;
    float timeBarHeight = 80;
    timeBar.setSize(Vector2f(timeBarStartWidth, timeBarHeight));
    timeBar.setFillColor(Color::Green);
    timeBar.setPosition(1920 / 2 - timeBarStartWidth / 2, 980);

    float timeRemaining = 6.0f;
    float timeBarWidthPerSecond = timeBarStartWidth / timeRemaining;


    SoundBuffer chopBuffer, deathBuffer, ootBuffer;
    chopBuffer.loadFromFile("/home/iteradmin/shanvi/sound/chop.wav");
    deathBuffer.loadFromFile("/home/iteradmin/shanvi/sound/death.wav");
    ootBuffer.loadFromFile("/home/iteradmin/shanvi/sound/out_of_time.wav");

    Sound chop, death, oot;
    chop.setBuffer(chopBuffer);
    death.setBuffer(deathBuffer);
    oot.setBuffer(ootBuffer);

  
    Clock clock;
    bool paused = true;
    bool acceptInput = false;
    int score = 0;

    
    while (window.isOpen()) {
        Event event;
        while (window.pollEvent(event)) {
            if (event.type == Event::Closed) window.close();
            if (event.type == Event::KeyReleased && !paused) {
                acceptInput = true;
                spriteAxe.setPosition(2000, spriteAxe.getPosition().y);
            }
        }

        if (Keyboard::isKeyPressed(Keyboard::Escape)) window.close();

        if (Keyboard::isKeyPressed(Keyboard::Return)) {
            paused = false;
            score = 0;
            timeRemaining = 6.0f;
            for (int i = 0; i < NUMBER_BRANCHES; i++) {
                branchPositions[i] = side::NONE;
            }
            spriteRIP.setPosition(675, 2000);
            spritePlayer.setPosition(580, 720);
            acceptInput = true;
        }

        if (acceptInput && !paused) {
            bool chopped = false;
            if (Keyboard::isKeyPressed(Keyboard::Right)) {
                playerSide = side::RIGHT;
                chopped = true;
            } else if (Keyboard::isKeyPressed(Keyboard::Left)) {
                playerSide = side::LEFT;
                chopped = true;
            }

            if (chopped) {
                score++;
                timeRemaining += (2.0f / score) + 0.15f;

                if (playerSide == side::RIGHT) {
                    spriteAxe.setPosition(AXE_POSITION_RIGHT, 830);
                    spritePlayer.setPosition(1200, 720);
                    logSpeedX = -5000;
                } else {
                    spriteAxe.setPosition(AXE_POSITION_LEFT, 830);
                    spritePlayer.setPosition(580, 720);
                    logSpeedX = 5000;
                }

                updateBranches(score);
                spriteLog.setPosition(810, 720);
                logActive = true;
                acceptInput = false;
                chop.play();
            }
        }

        if (!paused) {
            Time dt = clock.restart();
            timeRemaining -= dt.asSeconds();
            timeBar.setSize(Vector2f(timeBarWidthPerSecond * timeRemaining, timeBarHeight));

            if (timeRemaining <= 0.0f) {
                paused = true;
                messageText.setString("OUT OF TIME!");
                FloatRect textRect = messageText.getLocalBounds();
                messageText.setOrigin(textRect.left + textRect.width / 2.0f, textRect.top + textRect.height / 2.0f);
                oot.play();
            }

            // Bee and Clouds
            if (!beeActive) {
                beeSpeed = (rand() % 200) + 200;
                spriteBee.setPosition(2000, (rand() % 500) + 500);
                beeActive = true;
            } else {
                spriteBee.move(-beeSpeed * dt.asSeconds(), 0);
                if (spriteBee.getPosition().x < -100) beeActive = false;
            }

            for (int i = 0; i < 3; i++) {
                if (!cloudActive[i]) {
                    cloudSpeed[i] = (rand() % 200) + (i * 20);
                    clouds[i].setPosition(-300, (rand() % 150) + (i * 150));
                    cloudActive[i] = true;
                } else {
                    clouds[i].move(cloudSpeed[i] * dt.asSeconds(), 0);
                    if (clouds[i].getPosition().x > 2000) cloudActive[i] = false;
                }
            }

          
            std::stringstream ss;
            ss << "Score = " << score;
            scoreText.setString(ss.str());

   
            for (int i = 0; i < NUMBER_BRANCHES; i++) {
                float h = i * 150;
                if (branchPositions[i] == side::LEFT) {
                    branches[i].setPosition(610, h);
                    branches[i].setRotation(180);
                } else if (branchPositions[i] == side::RIGHT) {
                    branches[i].setPosition(1330, h);
                    branches[i].setRotation(0);
                } else {
                    branches[i].setPosition(3000, h);
                }
            }

           
            if (logActive) {
                spriteLog.move(logSpeedX * dt.asSeconds(), logSpeedY * dt.asSeconds());
                if (spriteLog.getPosition().x < -100 || spriteLog.getPosition().x > 2000) {
                    logActive = false;
                    spriteLog.setPosition(810, 720);
                }
            }

            if (branchPositions[5] == playerSide) {
                paused = true;
                acceptInput = false;
                spriteRIP.setPosition(spritePlayer.getPosition().x, 760);
                spritePlayer.setPosition(2000, 660);
                spriteAxe.setPosition(2000, 660);
                messageText.setString("SQUISHED!");
                FloatRect textRect = messageText.getLocalBounds();
                messageText.setOrigin(textRect.left + textRect.width / 2.0f, textRect.top + textRect.height / 2.0f);
                death.play();
            }
        }

        window.clear();
        window.draw(spriteBackground);
        for (int i = 0; i < 3; i++) window.draw(clouds[i]);
      
        for (int i = 0; i < NUMBER_BRANCHES; i++) window.draw(branches[i]);
        
        window.draw(spriteTree);
        window.draw(spritePlayer);
        window.draw(spriteAxe);
        window.draw(spriteLog);
        window.draw(spriteRIP);
        window.draw(spriteBee);
        window.draw(scoreText);
        window.draw(timeBar);

        if (paused) window.draw(messageText);

        window.display();
    }

    return 0;
}

void updateBranches(int seed) {
    for (int j = NUMBER_BRANCHES - 1; j > 0; j--) {
        branchPositions[j] = branchPositions[j - 1];
    }
    int r = (rand() % 5);
    switch (r) {
        case 0: branchPositions[0] = side::LEFT; break;
        case 1: branchPositions[0] = side::RIGHT; break;
        default: branchPositions[0] = side::NONE; break;
    }
}