import { Request, Response } from "express";
import { Mqtt } from "../models";
import { connect } from "../libraries/mqtt";

const mqttClient: any = connect();

/**
 * Data from Mqtt
 */
//@ts-ignore
export const postToMqtt = async () => {
  try {
    mqttClient.on("message", async (topic: string, payload: any) => {
      if (!topic.includes("/logs")) {
        let message = JSON.parse(payload);

        console.log("Received Message:", topic, message);
        let data = await Mqtt.create(message);
        data.save();
      }
    });
    console.log("Data Saved");
  } catch (error) {
    console.log(error);
  }
};

/**
 * Publish Data to MQtt
 * @param {Request} req - request object
 * @param {Response} res - response object
 */
export const publishToMqtt = async (req: Request, res: Response) => {
  try {
    let { message }: { message: string } = req?.body;
    const macAddress: string = `${req?.params?.macAddress}/client/${req?.body?.endPoint}`;

    // message = JSON.stringify(message);

    mqttClient.publish(
      macAddress,
      message,
      { qos: 0, retain: false },
      (error: Error) => {
        if (error) {
          console.error(error as Error);
        }
      }
    );

    return res.status(200).json({ message: "Data Published" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `INTERNAL SERVER ERROR: ${(error as Error).message}` });
  }
};

/**
 * Get Data By MacAdress
 * @param {Request} req - request object
 * @param {Response} res - response object
 */
export const getDataByMacAddress = async (req: Request, res: Response) => {
  try {
    const data = await Mqtt.find(req.body.query);
    return res.status(200).json({ data });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `INTERNAL SERVER ERROR: ${(error as Error).message}` });
  }
};
