export interface Coord {
    x: number;
    y: number;
}
declare global {
    interface Creep {
        registerMove: (target: DirectionConstant | RoomPosition | Coord) => void;
        _intendedPackedCoord?: number;
        _matchedPackedCoord?: number;
        _cachedMoveOptions?: Coord[];

        setWorkingArea: (target: RoomPosition, range: number) => void;
        _workingPos: RoomPosition;
        _workingRange: number;

        setAsObstacle: (isObstacle: boolean) => void;
        _isObstacle?: boolean;
    }
}
