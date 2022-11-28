from flask import Flask, jsonify
import flask
import json
import requests
import os
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"
base_url = "https://api2.splinterlands.com"

brawl_history = {"cycle": {}}
data_folder = "guild_brawls"


def save_json(filename, data):
    with open(filename, 'w') as f:
        json.dump(data, f)


def load_json(filename):
    with open(filename, 'r') as f:
        return json.load(f)


def save_all_brawl_data():
    i = 0
    for guild_id, guild_name in load_json("guild_id_mapping.json").items():
        print("\n", guild_name)

        if i > 5:
            time.sleep(5)
            i = 0

        directory = f"{data_folder}/{guild_id}"

        if not os.path.exists(directory):
            os.makedirs(directory)

        # Has all data for guildOverviewTable
        guild_brawl_data = get_guild_brawl_data(guild_id)

        save_json(f"{directory}/brawl_overview.json", guild_brawl_data)

        j = 0

        for brawl in guild_brawl_data:
            if j > 5:
                time.sleep(30)
                j = 0

            filename = f"{directory}/{brawl['tournament_id']}.json"

            print(brawl["tournament_id"])

            if not os.path.exists(filename):
                j += 1
                # ["guilds"] has all data for guildBrawlsTable
                # ["players"] has all data for singleBrawlTable
                single_brawl = get_single_brawl_data(guild_id, brawl["tournament_id"])
                save_json(filename, single_brawl)


def get_guild_brawl_data(guild_id):
    address = f"{base_url}/guilds/brawl_records?guild_id={guild_id}"
    return requests.get(address).json()["results"]


def get_single_brawl_data(guild_id, tournament_id):
    address = f"{base_url}/tournaments/find_brawl?guild_id={guild_id}&id={tournament_id}"
    return requests.get(address).json()


def get_guild_brawl_mapping():
    i = 0

    guild_brawl_mapping = {}
    guild_ids, guild_id_mapping = get_all_guilds()

    for guild_id in guild_ids:
        if i > 5:
            break
        i = i + 1
        j = 0

        brawl_data = get_guild_brawl_data(guild_id)
        guild_brawl_mapping[guild_id_mapping[guild_id]] = []

        for brawl in brawl_data:
            if j > 5:
                break
            j += 1
            guild_brawl_mapping[guild_id_mapping[guild_id]].append(brawl["tournament_id"])

    return


def save_guild_id_mappings():
    address = f"{base_url}/guilds/list"
    guilds_dict = requests.get(address).json()
    guild_id_mapping = {}

    for guild in guilds_dict:
        guild_id_mapping[guild["id"]] = guild["name"]

    save_json("guild_id_mapping.json", guild_id_mapping)


def build_brawl_history():
    power = load_json("power.json")
    for p in power:
        cycle = p['cycle']
        if cycle > 110:
            raw_data = load_json(f"power_brawls/{cycle}.json")
            brawl_history["cycle"][cycle] = {p["tournament_id"]: {},
                                             "guild_mapping": {p["name"]: p["tournament_id"],
                                                               "Digitspin FuriousChickens": p["tournament_id"]}}

            brawl_history["cycle"][cycle][p["tournament_id"]] = raw_data


def send_response(response):
    response = jsonify(response)
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


# @app.route("/guild_id_mapping", methods=['GET'])
# def send_brawl_history():
#     build_brawl_history()
#     return send_response(brawl_history)


@app.route("/guild_id_mapping", methods=['GET'])
def send_guild_id_mapping():
    guild_id_mapping = load_json("guild_id_mapping.json")
    return send_response(guild_id_mapping)


@app.route("/guild_brawls", methods=['GET'])
def send_guild_brawls():
    guild_id = flask.request.args["guild_id"]
    brawl_id = flask.request.args["brawl_id"]
    filename = f"{data_folder}/{guild_id}/{brawl_id}.json"
    data = load_json(filename)["guilds"]
    return send_response(data)


@app.route("/single_brawl", methods=['GET'])
def send_single_brawl():
    guild_id = flask.request.args["guild_id"]
    brawl_id = flask.request.args["brawl_id"]

    idx = brawl_id.rfind('-')
    brawl_id = f"{brawl_id[:idx]}-BRAWL"

    for i in range(1, 11):
        filename = f"{data_folder}/{guild_id}/{brawl_id}{i}.json"
        if os.path.isfile(filename):
            data = load_json(filename)["players"]
            return send_response(data)

    return None


@app.route("/guild_overview", methods=['GET'])
def send_guild_overview():
    guild_id = flask.request.args["guild_id"]
    filename = f"{data_folder}/{guild_id}/brawl_overview.json"
    data = load_json(filename)
    return send_response(data)


@app.route("/guild_name_mapping", methods=['GET'])
def send_guild_name_mapping():
    guild_id_mapping = load_json("guild_id_mapping.json")
    guild_name_mapping = dict((v, k) for k, v in guild_id_mapping.items())
    return send_response(guild_name_mapping)


@app.route('/settings', methods=["GET"])
def send_settings():
    return send_response(requests.get("https://api2.splinterlands.com/settings").json())


my_array = load_json("power_brawls/115.json")


if __name__ == "__main__":
    # # save_json("power.json", get_guild_brawl_data("b6e3ac27024129b1163e2e42b3c1a0a010112021"))
    # power = load_json("power.json")
    # print(len(power))
    # for p in power:
    #     brawl = get_single_brawl_data(p["guild_id"], p["tournament_id"])
    #     save_json(f"power_brawls/{p['cycle']}.json", brawl)
    # print(p["tournament_id"])
    app.run(debug=True)
    # save_all_brawl_data()
