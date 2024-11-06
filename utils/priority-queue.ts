export class PriorityQueue {
  private heap: any[];

  constructor() {
    this.heap = [];
  }

  private parent(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  private leftChild(index: number): number {
    return 2 * index + 1;
  }

  private rightChild(index: number): number {
    return 2 * index + 2;
  }

  private swap(index1: number, index2: number): void {
    const temp = this.heap[index1];
    this.heap[index1] = this.heap[index2];
    this.heap[index2] = temp;
  }

  insert(task: any): void {
    this.heap.push(task);
    this.heapifyUp(this.heap.length - 1);
  }

  private heapifyUp(index: number): void {
    while (
      index > 0 &&
      this.heap[this.parent(index)].priority > this.heap[index].priority
    ) {
      this.swap(index, this.parent(index));
      index = this.parent(index);
    }
  }

  extractMin(): any {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.heapifyDown(0);

    return min;
  }

  private heapifyDown(index: number): void {
    let minIndex = index;
    const leftChild = this.leftChild(index);
    const rightChild = this.rightChild(index);

    if (
      leftChild < this.heap.length &&
      this.heap[leftChild].priority < this.heap[minIndex].priority
    ) {
      minIndex = leftChild;
    }

    if (
      rightChild < this.heap.length &&
      this.heap[rightChild].priority < this.heap[minIndex].priority
    ) {
      minIndex = rightChild;
    }

    if (index !== minIndex) {
      this.swap(index, minIndex);
      this.heapifyDown(minIndex);
    }
  }
}
