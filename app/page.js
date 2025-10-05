'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

const INITIAL_BOARD = [
  ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
  ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
  ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
];

const WHITE_PIECES = ['♔', '♕', '♖', '♗', '♘', '♙'];
const BLACK_PIECES = ['♚', '♛', '♜', '♝', '♞', '♟'];

export default function ChessGame() {
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState('white');
  const [validMoves, setValidMoves] = useState([]);
  const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });
  const [gameStatus, setGameStatus] = useState('');

  const isWhitePiece = (piece) => WHITE_PIECES.includes(piece);
  const isBlackPiece = (piece) => BLACK_PIECES.includes(piece);

  const getPieceType = (piece) => {
    const types = {
      '♔': 'king', '♚': 'king',
      '♕': 'queen', '♛': 'queen',
      '♖': 'rook', '♜': 'rook',
      '♗': 'bishop', '♝': 'bishop',
      '♘': 'knight', '♞': 'knight',
      '♙': 'pawn', '♟': 'pawn'
    };
    return types[piece] || '';
  };

  const getValidMoves = (row, col, piece) => {
    const moves = [];
    const type = getPieceType(piece);
    const isWhite = isWhitePiece(piece);

    const addMove = (r, c) => {
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const targetPiece = board[r][c];
        if (!targetPiece) {
          moves.push([r, c]);
          return true;
        } else if (isWhite ? isBlackPiece(targetPiece) : isWhitePiece(targetPiece)) {
          moves.push([r, c]);
          return false;
        }
        return false;
      }
      return false;
    };

    switch (type) {
      case 'pawn':
        const direction = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;

        if (!board[row + direction]?.[col]) {
          moves.push([row + direction, col]);
          if (row === startRow && !board[row + 2 * direction]?.[col]) {
            moves.push([row + 2 * direction, col]);
          }
        }

        [col - 1, col + 1].forEach(c => {
          const target = board[row + direction]?.[c];
          if (target && (isWhite ? isBlackPiece(target) : isWhitePiece(target))) {
            moves.push([row + direction, c]);
          }
        });
        break;

      case 'rook':
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
          for (let i = 1; i < 8; i++) {
            if (!addMove(row + dr * i, col + dc * i)) break;
          }
        });
        break;

      case 'bishop':
        [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
          for (let i = 1; i < 8; i++) {
            if (!addMove(row + dr * i, col + dc * i)) break;
          }
        });
        break;

      case 'queen':
        [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
          for (let i = 1; i < 8; i++) {
            if (!addMove(row + dr * i, col + dc * i)) break;
          }
        });
        break;

      case 'knight':
        [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]].forEach(([dr, dc]) => {
          addMove(row + dr, col + dc);
        });
        break;

      case 'king':
        [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
          addMove(row + dr, col + dc);
        });
        break;
    }

    return moves;
  };

  const handleSquareClick = (row, col) => {
    const piece = board[row][col];

    if (selectedSquare) {
      const [selectedRow, selectedCol] = selectedSquare;
      const isValidMove = validMoves.some(([r, c]) => r === row && c === col);

      if (isValidMove) {
        const newBoard = board.map(r => [...r]);
        const movingPiece = newBoard[selectedRow][selectedCol];
        const capturedPiece = newBoard[row][col];

        if (capturedPiece) {
          const capturedBy = isWhitePiece(movingPiece) ? 'white' : 'black';
          setCapturedPieces(prev => ({
            ...prev,
            [capturedBy]: [...prev[capturedBy], capturedPiece]
          }));

          if (getPieceType(capturedPiece) === 'king') {
            setGameStatus(`${currentPlayer.toUpperCase()} wins!`);
          }
        }

        newBoard[row][col] = movingPiece;
        newBoard[selectedRow][selectedCol] = '';
        setBoard(newBoard);
        setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
        setSelectedSquare(null);
        setValidMoves([]);
      } else if (piece && ((currentPlayer === 'white' && isWhitePiece(piece)) || (currentPlayer === 'black' && isBlackPiece(piece)))) {
        setSelectedSquare([row, col]);
        setValidMoves(getValidMoves(row, col, piece));
      } else {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    } else if (piece) {
      if ((currentPlayer === 'white' && isWhitePiece(piece)) || (currentPlayer === 'black' && isBlackPiece(piece))) {
        setSelectedSquare([row, col]);
        setValidMoves(getValidMoves(row, col, piece));
      }
    }
  };

  const resetGame = () => {
    setBoard(INITIAL_BOARD);
    setSelectedSquare(null);
    setCurrentPlayer('white');
    setValidMoves([]);
    setCapturedPieces({ white: [], black: [] });
    setGameStatus('');
  };

  const isValidMoveSquare = (row, col) => {
    return validMoves.some(([r, c]) => r === row && c === col);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Chess Game</h1>

      <div className={styles.gameInfo}>
        <div className={styles.status}>
          {gameStatus || `Current Player: ${currentPlayer.toUpperCase()}`}
        </div>
        <button onClick={resetGame} className={styles.resetBtn}>New Game</button>
      </div>

      <div className={styles.capturedSection}>
        <div className={styles.captured}>
          <strong>White captured:</strong> {capturedPieces.white.join(' ')}
        </div>
        <div className={styles.captured}>
          <strong>Black captured:</strong> {capturedPieces.black.join(' ')}
        </div>
      </div>

      <div className={styles.board}>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.row}>
            {row.map((piece, colIndex) => {
              const isLight = (rowIndex + colIndex) % 2 === 0;
              const isSelected = selectedSquare && selectedSquare[0] === rowIndex && selectedSquare[1] === colIndex;
              const isValid = isValidMoveSquare(rowIndex, colIndex);

              return (
                <div
                  key={colIndex}
                  className={`${styles.square} ${isLight ? styles.light : styles.dark} ${isSelected ? styles.selected : ''} ${isValid ? styles.validMove : ''}`}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                >
                  <span className={styles.piece}>{piece}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
