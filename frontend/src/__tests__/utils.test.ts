describe("Basic Jest Functionality", () => {
  it("should perform basic arithmetic correctly", () => {
    expect(2 + 2).toBe(4);
    expect(10 - 5).toBe(5);
    expect(3 * 4).toBe(12);
    expect(8 / 2).toBe(4);
  });

  it("should handle string operations", () => {
    const greeting = "Hello";
    const name = "World";
    expect(`${greeting} ${name}`).toBe("Hello World");
  });

  it("should work with arrays", () => {
    const fruits = ["apple", "banana", "orange"];
    expect(fruits).toHaveLength(3);
    expect(fruits).toContain("banana");
  });

  it("should work with objects", () => {
    const person = { name: "Juan", age: 30 };
    expect(person).toHaveProperty("name");
    expect(person.name).toBe("Juan");
  });

  it("should handle promises", async () => {
    const promise = Promise.resolve("success");
    await expect(promise).resolves.toBe("success");
  });
});
