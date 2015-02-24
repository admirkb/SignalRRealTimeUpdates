using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using MongoDB.Driver;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver.Linq;
using Newtonsoft.Json;
using MongoDB.Driver.Builders;

namespace WebApplication1.Hubs
{
    public class SignalRRealTimeUpdatesMongoDBHub : Hub
    {
        private string connectionString;
        private MongoClient client;
        private MongoServer server;
        private MongoDatabase database;

        public SignalRRealTimeUpdatesMongoDBHub()
        {
            connectionString = "mongodb://localhost";
            client = new MongoClient(connectionString);
            server = client.GetServer();
            database = server.GetDatabase("test"); // "test" is the name of the database

        }
        public void GetBugs()
        {


            var collection = database.GetCollection<BugMDB>("bugs");

            var bugs = from e in collection.AsQueryable<BugMDB>()
                       select e;

            Clients.Caller.Bugs(bugs);

        }
        public void DeleteBug(string bug, int key)
        {
            //ObjectId bug;
            //ObjectId.TryParse(bugId, out bug);
            var bugS = JsonConvert.DeserializeObject<BugMDB>(bug);

            try
            {
                var bugs = database.GetCollection<BugMDB>("bugs");
                var query = Query<BugMDB>.EQ(e => e.Id, bugS.Id);
                bugs.Remove(query);

                Clients.All.DeleteBug(key);
            }
            catch (Exception ex)
            {

            }
        }

        public bool AddBug(BugMDB bug, int key)
        {

            try
            {

                var bugs = database.GetCollection<BugMDB>("bugs");
                var b = new BugMDB { Problem = bug.Problem, Response = bug.Response, DateCreated = DateTime.Now };
                bugs.Insert(b);


                Clients.Others.AddBug(b);
                Clients.Caller.AddMeBug(b, key);
                return true;

            }
            catch (Exception ex)
            {
                Clients.Caller.reportError("Unable to create bug.");
                return false;
            }



        }
        public bool UpdateBug(string bug, int key)
        {
            var bugS = JsonConvert.DeserializeObject<BugMDB>(bug);
            //ObjectId id;
            //ObjectId.TryParse(bug.Id, out id);

            try
            {
                var bugs = database.GetCollection<BugMDB>("bugs");
                var query = Query<BugMDB>.EQ(e => e.Id, bugS.Id);
                BugMDB b = bugs.FindOne(query);
                b.Problem = (b.Problem != bugS.Problem) ? bugS.Problem : b.Problem;
                if (b.Response != bugS.Response)
                {
                    b.Response = bugS.Response;
                    b.DateResolved = DateTime.Now;
                }
                bugs.Save(b);

                Clients.All.UpdateBug(b, key);

                return true;
            }
            catch (Exception ex)
            {
                return false;
            }




        }
        public bool EditNotifyBug(string bug, int key)
        {
            var bugS = JsonConvert.DeserializeObject<BugMDB>(bug);
            try
            {

                Clients.Others.EditNotifyBug(bugS, key);
                //Clients.All.EditNotifyBug(bug, key);
                return true;

            }
            catch (Exception ex)
            {
                Clients.Caller.reportError("Unable to notify bug.");
                return false;
            }



        }
        public bool EditAllowBug(string bug, int key)
        {
            var bugS = JsonConvert.DeserializeObject<BugMDB>(bug);
            try
            {

                Clients.Others.EditAllowBug(bugS, key);
                //Clients.All.EditNotifyBug(bug, key);
                return true;

            }
            catch (Exception ex)
            {
                Clients.Caller.reportError("Unable to notify bug.");
                return false;
            }



        }


    }

    public class CustomerMDB
    {
        public ObjectId Id { get; set; }
        public string Name { get; set; }
    }

    public class BugMDB
    {
        // Remember: JSON cannot serialise objectid without setting id to string and using following attribute
        // https://groups.google.com/forum/#!topic/mongodb-csharp/A_DXHuPscnQ

        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string Name { get; set; }
        public string Problem { get; set; }
        public string Response { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime DateResolved { get; set; }
    }
}