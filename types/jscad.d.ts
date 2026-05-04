declare module '@jscad/modeling' {
  const modeling: {
    booleans: {
      subtract: (...objects: any[]) => any;
      union: (...objects: any[]) => any;
    };
    primitives: {
      cuboid: (options: Record<string, unknown>) => any;
      cylinder: (options: Record<string, unknown>) => any;
    };
    transforms: {
      translate: (offset: number[], object: any) => any;
    };
  };
  export default modeling;
}

declare module '@jscad/stl-serializer' {
  const stlSerializer: {
    serialize: (options: { binary?: boolean }, ...objects: any[]) => string[];
  };
  export default stlSerializer;
}
