# Facio
A free, open-source and programmable facial recognition software. Allows you to run Python (and more...) scripts for every face that is detected.

## Build
You can download the source code and run the following commands to build an executable for **Linux** and **Windows**.

- Windows:
```
npm run build:win
npm run dist:win
```
Since I don't use Windows anymore, I can't guarantee full support for windows but the last time I checked these command generated an executable which worked well.

- Linux:
```
npm run build:linux
npm run dist:linux
```

For Linux, once built, you will find the **AppImage** file and **Debian** installer in the `release` folder. If none of these are supported by your distribution, you can find a universal executable in the `linux-unpacked` folder which should run on any distribution.
