// import { Response, Request, NextFunction } from 'express';
// import { Order } from 'sequelize';

// export type ArrayOrder = [
//   /** field */
//   string,
//   /** order */
//   'desc' | 'asc',
// ];

// export interface QueryPagination {
//   page?: number;
//   size?: number;
//   order?: Order | ArrayOrder;
//   search?: string;
// }

// function extractRequestArray(queryOrder: string | string[]): string[] {
//   if (queryOrder instanceof Array) return queryOrder;
//   return queryOrder.split(',');
// }

// export default function pagination(
//   req: Request,
//   _res: Response,
//   next: NextFunction,
// ): QueryPagination | void {
//   const { query, body } = req;

//   const page = parseInt(query?.page || body?.page, 10) || 1;
//   const size = parseInt(query?.size || body?.size, 10) || 12;
//   const reqOrder = extractRequestArray(query?.order || body?.order || 'asc');
//   const reqOrderBy = extractRequestArray(query?.orderby || body?.orderby || 'id');

//   const search = query?.search ? `${query?.search}` : null;

//   const order = reqOrderBy.reduce((o, item, i) => {
//     const ord = reqOrder[i] ? `${reqOrder[i] === 'desc' ? reqOrder[i] : 'asc'}` : 'asc';
//     o.push([item, ord]);
//     return o;
//   }, []);

//   req.pagination = { page, size, order, search };

//   if (next) return next();
//   return { ...req.pagination };
// }

export {};
