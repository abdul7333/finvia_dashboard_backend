import { Request, Response } from "express";
import Calls, { ICalls } from "../../models/calls/callsModel";
import User from "../../models/users/userModel";
import ProfileModel from "../../models/profile/profileModel";

export const createCalls = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const calls = new Calls({
      ...req.body,
    });
    await calls.save();
    res.status(201).json(calls);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
};

export const updateCalls = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const {
    stock,
    action,
    type,
    quantity,
    entry,
    target1,
    target2,
    stopLoss,
    booked,
    roi,
    PandL,
    status,
  } = req.body;
  try {
    const updatedCalls: ICalls | null = await Calls.findByIdAndUpdate(
      id,
      {
        stock,
        action,
        type,
        quantity,
        entry,
        target1,
        target2,
        stopLoss,
        booked,
        roi,
        PandL,
        status,
      },
      { new: true }
    );
    if (!updatedCalls) {
      res.status(404).json({ error: "Calls not found" });
    } else {
      res.status(200).json(updatedCalls);
    }
  } catch (error) {
    console.error("Error updating Calls:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllCalls = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { pageSize, page, searchQuery, sortBy } = req.body;
  try {
    const pageNumber = +page;

    const limitNumber = +pageSize;

    const regexPattern = new RegExp(searchQuery as string, "i");
    const pipeLine: Array<any> = [
      {
        $project: {
          stock: 1,
          action: 1,
          type: 1,
          quantity: 1,
          entry: 1,
          target1: 1,
          target2: 1,
          stopLoss: 1,
          booked: 1,
          roi: 1,
          PandL: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $skip: +(pageNumber - 1) * limitNumber,
      },
      {
        $limit: limitNumber,
      },
      { $sort: { [sortBy.field]: +sortBy.by } },
    ];


    if (searchQuery && searchQuery.length) {
      pipeLine.unshift({
        $match: {
          $or: [
            { stock: { $regex: regexPattern } },
            { action: { $regex: regexPattern } },
            { type: { $regex: regexPattern } },
            { status: { $regex: regexPattern } },
          ],
        },
      });
    } else {
      pipeLine.unshift({ $match: {} });
    }

    const me = await User.findOne({ _id: (req as any).userId });
    const permission = await ProfileModel.findOne({
      _id: me?.role,
      status: true,
    });
    const isReadUser = permission?.permission.calls.view;

    let calls = [] as any[];

    if (isReadUser) {
      const CallsData = await Calls.aggregate(pipeLine);
      calls = CallsData;
      const totalCalls = await Calls.countDocuments();
      return res.status(200).json({
        page: pageNumber,
        pageSize: limitNumber,
        totalPages: Math.ceil(totalCalls / limitNumber),
        totalCalls,
        calls: CallsData,
        permission,
      });
    } else {
      return res.status(200).json({
        page: pageNumber,
        pageSize: limitNumber,
        totalPages: 0,
        totalCalls: 0,
        calls,
        permission,
      });
    }
  } catch (error) {
    console.error("Error fetching Calls:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllCallsBar = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { filter, type } = req.body;
    const filterNumber = parseInt(filter)
    const pipeline: Array<any> = [
      {
        $match: { "type": type }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $addFields: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" }
        }
      },
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          totalValue: {
            $sum: "$PandL"
          }
        }
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          year: "$_id.year",
          totalValue: 1
        }
      },
      {
        $sort: { year: -1, month: -1 }
      }
    ];
    if (filterNumber != 1 && filterNumber != -1) {
      pipeline.push({
        $limit: filterNumber
      })
      pipeline.push({
        $sort: { year: 1, month: 1 }
      })
    }
    else {
      const date = new Date();
      const month = date.getMonth();
      const year = date.getFullYear();
      if (filterNumber == 1) {
        const startOfMonth = new Date(year, month, 1)
        const endOfMonth = new Date(year, month + 1, 1)
        pipeline.splice(0, pipeline.length)
        pipeline.push({
          $match: {
            $expr: {
              $and: [
                { $gte: ["$createdAt", startOfMonth] },
                { $lte: ["$createdAt", endOfMonth] }
              ]
            }
          }
        })
      }
      if (filterNumber == -1) {
        const startOfThisMonth = new Date(year, month, 1);
        const startOfLastMonth = new Date(startOfThisMonth.getFullYear(), startOfThisMonth.getMonth() - 1, 1);
        const endOfLastMonth = new Date(startOfThisMonth.getTime() - 1);
        pipeline.splice(0, pipeline.length)
        pipeline.push({
          $match: {
            $expr: {
              $and: [
                { $gte: ["$createdAt", startOfLastMonth] },
                { $lte: ["$createdAt", endOfLastMonth] }
              ]
            }
          }
        })
      }
      pipeline.push({
        $group: {
          _id: { $dayOfMonth: "$createdAt" },
          totalValue: { $sum: "$PandL" }
        }
      },
        {
          $project: {
            _id: 0,
            date: "$_id",
            totalValue: 1
          }
        }, {
        $sort: { date: 1 }
      });
    }

    const CallsData = await Calls.aggregate(pipeline)
    return res.status(200).json({
      calls: CallsData
    })
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const getAllCallsSummary = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const {type} = req.params
  try {
    const pipeline: Array<any> = [
      {
        $match: { "type": type }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: 500
      }
    ]

    const CallsSummary = await Calls.aggregate(pipeline);
    const totalCalls = await Calls.countDocuments();

    return res.status(200).json({
      calls: CallsSummary,
      totalCalls: totalCalls
    })
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const getAllCallsWebsite = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { pageSize, page, range, type } = req.body;
  try {
    const pageNumber = +page;

    const limitNumber = +pageSize;


    const pipeLine: Array<any> = []

    if (range.startDate != "") {
      pipeLine.push({
        $match: {
          $expr: {
            $and: [
              { $gte: ["$createdAt", new Date(range.startDate)] },
              { $lte: ["$createdAt", new Date(range.endDate)] }
            ]
          }
        }
      })
    }

    pipeLine.push(
      {
        $match: { "type": type }
      },
      {
        $project: {
          stock: 1,
          action: 1,
          type: 1,
          quantity: 1,
          entry: 1,
          target1: 1,
          target2: 1,
          stopLoss: 1,
          booked: 1,
          roi: 1,
          PandL: 1,
          status: 1,
        },
      },
      {
        $skip: +(pageNumber - 1) * limitNumber,
      },
      {
        $limit: limitNumber,
      })

    const CallsData = await Calls.aggregate(pipeLine);
    const totalCalls = await Calls.countDocuments();
    return res.status(200).json({
      page: pageNumber,
      pageSize: limitNumber,
      totalPages: Math.ceil(totalCalls / limitNumber),
      totalCalls,
      calls: CallsData
    })
  } catch (error) {
    console.error("Error fetching Calls:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};




