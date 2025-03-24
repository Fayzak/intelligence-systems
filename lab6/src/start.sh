node ./app_goalie.js --x=-30 --y=0 --teamName=$1 &

node ./app_feeder.js --x=-15 --y=0 --line="c" --teamName=$1 &
node ./app_feeder.js --x=-15 --y=-10 --line="t" --teamName=$1 &
node ./app_feeder.js --x=-15 --y=10 --line="b" --teamName=$1 &

node ./app_attacker.js --x=-7 --y=0 --position="fp" --line="c" --teamName=$1 &
node ./app_attacker.js --x=-10 --y=-20 --position="fp" --line="t" --teamName=$1 &
node ./app_attacker.js --x=-10 --y=20 --position="fp" --line="b" --teamName=$1 &

# node ./app_defender.js --x=-20 --y=0 --position="fp" --line="c" --teamName=$1 &
node ./app_defender.js --x=-17 --y=-17 --position="fg" --line="t" --teamName=$1 &
node ./app_defender.js --x=-17 --y=17 --position="fg" --line="b" --teamName=$1 &

node ./app_crazy.js --x=-12 --y=-5 --teamName=$1 &
node ./app_crazy.js --x=-12 --y=5 --teamName=$1 &
