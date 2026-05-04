export function ultraLesson() {
  return [
    {
      terms: [
        { id: "a", value: "10", side: "left" },
        { id: "b", value: "+ 2x", side: "left" },
        { id: "c", value: "30", side: "right" },
      ],
      description: "Ecuación inicial",
    },
    {
      terms: [
        { id: "a", value: "10", side: "left" },
        { id: "b", value: "+ 2x", side: "left" },
        { id: "c", value: "30", side: "right" },
      ],
      move: {
        id: "a",
        to: "right",
        newValue: "-10",
      },
      description: "Pasamos el 10 restando al otro lado",
    },
    {
      terms: [
        { id: "b", value: "2x", side: "left" },
        { id: "c", value: "20", side: "right" },
      ],
      description: "Simplificamos",
    },
    {
      terms: [
        { id: "b", value: "x", side: "left" },
        { id: "c", value: "10", side: "right" },
      ],
      description: "Dividimos por 2",
    },
  ]
}
