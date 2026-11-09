#!/bin/bash
set -e
S=/tmp/claude-0/-home-user-A5harib/edf13d4d-2c35-5140-b5aa-03b7e2f84faa/scratchpad/render; D=/home/user/A5harib/managing-impulsivity/video
cd $S && python3 - <<'PY'
import json
fr=json.load(open('full/frames.json'));ev=json.load(open('full/events.json'))['ev'];T0=fr[0][1]
seen={}
for e in ev:
    if e['k']=='scene' and e['ch'] not in seen: seen[e['ch']]=e['t']-T0
cuts=[0]+[round(seen[c]-0.25,2) for c in ['a1','a2','a3','a4','rev']]+[round(fr[-1][1]-T0,2)]
json.dump({'cuts':cuts},open('cuts.json','w')); print(cuts)
PY
cd $D && rm -f parts/*.mp4 && cp $S/full/managing-impulsivity.mp4 Managing-Impulsivity-1080p.mp4 && M=Managing-Impulsivity-1080p.mp4
read -a C < <(python3 -c "import json;print(*json.load(open('$S/cuts.json'))['cuts'])")
N=("Part-0-Introduction" "Part-1-Unit-1-Stop-Think-Act" "Part-2-Unit-2-Time-and-Waiting" "Part-3-Unit-3-Consequences-and-Decisions" "Part-4-Unit-4-Coping-Strategies" "Part-5-Revision-and-Grand-Challenge")
enc(){ a=$2; b=$3; fo=$(python3 -c "print(round($b-$a-0.6,2))"); ffmpeg -y -v error -ss $a -to $b -i $M -vf "scale=1280:720,fade=t=in:st=0:d=0.3,fade=t=out:st=$fo:d=0.6" -af "afade=t=in:st=0:d=0.3,afade=t=out:st=$fo:d=0.6" -c:v libx264 -preset medium -crf 23 -tune animation -c:a aac -b:a 160k -movflags +faststart "parts/$1.mp4"; }
for i in 0 1 2; do enc ${N[$i]} ${C[$i]} ${C[$((i+1))]} & done; wait
for i in 3 4 5; do enc ${N[$i]} ${C[$i]} ${C[$((i+1))]} & done
ffmpeg -y -v error -i $M -vf scale=1280:720 -c:v libx264 -preset medium -crf 24 -tune animation -c:a aac -b:a 160k -movflags +faststart Managing-Impulsivity-720p.mp4; wait
ls -la $D/*.mp4 $D/parts
