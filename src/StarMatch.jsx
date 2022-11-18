import React, { useEffect, useState } from 'react'

const StarsDisplay = ({stars}) =>
  <div>
    {utils.range(1, stars).map(starId =>
      <div key={starId} className="star" />
    )}
  </div>

const NumberGrid = ({status, number, onNumberClick }) =>
  <button className="number" style={{ backgroundColor: colors[status]}} onClick={() => onNumberClick(number, status)}>
    {number}
  </button>

const PlayAgain = ({resetGame, gameStatus}) => 
  <div className="game-done">
    <div className="message" style={{ color: gameStatus === 'won' ? 'green' : 'red' }}>
      {gameStatus === 'won' ? 'Nice!' : 'Game Over' }
    </div>
    <button onClick={resetGame}>Play Again</button>
  </div>

export const Game = ({startNewGame}) => {
  const [stars, setStars] = useState(utils.random(1, 9))
  const [availableNums, setAvailableNums] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9]) //availableNums are numbers that havent been used yet
  const [candidateNums, setCandidateNums] = useState([]) //candidateNums is an array of numbers that are currently selected by the user
  const [secondsLeft, setSecondsLeft] = useState(10)

  useEffect(() => {
    if(secondsLeft > 0 && availableNums.length > 0) {
      const timerId = setTimeout(()=>{
        setSecondsLeft(secondsLeft -1)
      }, 1000)
      return () => clearTimeout(timerId)
    }
  })
  
  const candidatesAreWrong = utils.sum(candidateNums) > stars
  const gameStatus = availableNums.length === 0 ? 'won' : secondsLeft === 0 ? 'lost' : 'active'
  const timerNumber = secondsLeft <= 3 ? 'running-out' : ''

  const resetGame = () => {
    setStars(utils.random(1, 9))
    setAvailableNums([1, 2, 3, 4, 5, 6, 7, 8, 9])
    setCandidateNums([])
    setSecondsLeft(10)
  }
  
  const numberStatus = (number) => {
    if(!availableNums.includes(number)){
      return 'used'
    }
    if(candidateNums.includes(number)){
      return candidatesAreWrong ? 'wrong' : 'candidate'
    }
    return 'available'
  }

  const onNumberClick = (number, currentStatus) => {
    if(gameStatus !== 'active' || currentStatus === 'used'){
      return
    }
    const newCandidateNums = 
      currentStatus === 'available'   //if number is available/grey
        ? candidateNums.concat(number)  //add the number just clicked to the array of candidate nums
        : candidateNums.filter(cn => cn !== number)  //otherwise remove (filter) the number just clicked from the array of candidate nums

    if(utils.sum(newCandidateNums) !== stars){
      setCandidateNums(newCandidateNums)
    } else {
      //in this case we have a correct pick, where the sum of the selected (candidate) numbers IS equal to the number of stars
      const newAvailableNums = availableNums.filter(
        n => !newCandidateNums.includes(n) //filter out any of the previous available numbers found in the new candidateNums used in the correct pick
      )
      //need to redraw stars (from whats available in newAvailableNums array)
      setStars(utils.randomSumIn(newAvailableNums, 9))
      setAvailableNums(newAvailableNums)
      setCandidateNums([])
    }
  }
    
  return (
    <div className="game">
      <div className="help">
        <h2>Pick 1 or more numbers that sum to the number of stars </h2>
      </div>
      <div className="body">
        <div className="left">
          {gameStatus !== 'active' ? (<PlayAgain onClick={startNewGame} resetGame={resetGame} gameStatus={gameStatus} />) : <StarsDisplay stars={stars} />}
        </div>
        <div className="right">
        	{utils.range(1, 9).map(number =>
          	<NumberGrid 
              key={number}
              status={numberStatus(number)}
              number={number}
              onNumberClick={onNumberClick}
            />
          )}
        </div>
      </div>
      <div className="timer">
        <h4>Time Remaining: <span className={`timerNumber-${timerNumber}`}>{secondsLeft}</span> </h4>
      </div>
    </div>
  )
}

export const StarMatch = () => {
  const [gameId, setGameId] = useState(1)
  return <Game key={gameId} startNewGame={() => setGameId(gameId + 1)} />
  //when the key is incremented by 1, React will unmount the previous Game component and mount a new one with the new key, rendering a new Game
}

// Color Theme
const colors = {          //The number panels change backgroundColor based on the 'status' prop passed into the NumberGrid component
  available: 'lightgray', //number panel will remain grey if the number is still available
  used: 'lightgreen',     //number panel will turn green if the number has already been used in a previous sum
  wrong: 'lightcoral',    //number panel will turn red if the sum of the candidateNums array is greater than the value for 'stars', if the sum is wrong
  candidate: 'deepskyblue', //number panel will turn blue if the current sum of the candidateNums is less than the value for 'stars'
}

// Maths science
const utils = {
  // Sum an array
  sum: arr => arr.reduce((acc, curr) => acc + curr, 0),

  // create an array of numbers between min and max (edges included)
  range: (min, max) => Array.from({ length: max - min + 1 }, (_, i) => min + i),

  // pick a random number between min and max (edges included)
  random: (min, max) => min + Math.floor(Math.random() * (max - min + 1)),

  // Given an array of numbers and a max...
  // Pick a random sum (< max) from the set of all available sums in arr
  randomSumIn: (arr, max) => {
    const sets = [[]]
    const sums = []
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0, len = sets.length; j < len; j++) {
        const candidateSet = sets[j].concat(arr[i]);
        const candidateSum = utils.sum(candidateSet);
        if (candidateSum <= max) {
          sets.push(candidateSet)
          sums.push(candidateSum)
        }
      }
    }
    return sums[utils.random(0, sums.length - 1)]
  },
}