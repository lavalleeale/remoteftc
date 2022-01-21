# Remote FTC
## Intro
This is meant to be a project to help teams that have team members quanatined but still wish to be able to host driver practice remotely. It allows a driver to control the robot remotely, from another location.
# How do I use it?
1. Edit `build.dependencies.gradle` to add `maven { url = 'https://maven.lavallee.one/releases' }` to `repositories` and `implementation 'com.lavalleeale.remoteftc:remoteftc:0.1.21'` to `dependencies`
2. Have the driver either visit [this hosted copy](https://remoteftc.lavallee.one) or host your own
3. Have the proxy computer download the .exe from the releases section of github or build your own **NOTE**: this computer must both be able to access the internet and connect to the robot at the same time. While making this project, we did this by connecting with ethernet to the internet, and connecting with wifi to the robot, though other options may exist.
4. Have the driver click open the control tab and the proxy open the proxy tab
5. Have the driver enter the room code that is being shown on the proxy's screen and hit submit
6. Select an opmode, initialize, and hit start
7. While driving, use a video calling app for the driver to see the robot. This project does not have a camera view of the robot.
