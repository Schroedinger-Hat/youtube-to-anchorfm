const youtubedl = require('youtube-dl')
const fs = require('fs')
const { exec } = require('child_process');

const YT_URL = 'https://www.youtube.com/watch?v=';
const pathToEpisodeJSON = 'episode.json';
const outputFile = 'episode.webm'

try {
    const epConfJSON = JSON.parse(fs.readFileSync(pathToEpisodeJSON, 'utf-8'));
    
    const YT_ID = epConfJSON.id;
    const url = YT_URL + YT_ID;
    
    youtubedl.getInfo(url, function(err, info) {
        if (err) throw err;
        epConfJSON.title = info.title;
        epConfJSON.description = info.description;
        const youtubeDlCommand = `youtube-dl -o ${outputFile} -f bestaudio[ext=webm] ${url}`;
    
        exec(youtubeDlCommand, (error, stdout, stderr) => {
          if (error) {
            console.log(`error: ${error.message}`)
            return
          }
          if (stderr) {
            console.log(`stderr: ${stderr}`)
            return
          }
          console.log(`stdout: ${stdout}`)
          fs.writeFileSync(pathToEpisodeJSON, JSON.stringify(epConfJSON));
        });
    });

} catch (error) {
    throw error;
}